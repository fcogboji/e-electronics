// File: /app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = env.PAYSTACK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  console.log('🔔 Paystack webhook received');
  const rawBody = await req.text();
  const hash = crypto
    .createHmac('sha512', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const signature = req.headers.get('x-paystack-signature');

  if (hash !== signature) {
    console.error('❌ Webhook signature verification failed');
    return new NextResponse('Webhook signature verification failed.', { status: 400 });
  }

  console.log('✅ Webhook signature verified');

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('❌ Failed to parse webhook body:', err);
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  if (event.event !== 'charge.success') {
    console.log('⚠️ Unhandled event type:', event.event);
    return new NextResponse('Unhandled event', { status: 200 });
  }

  try {
    console.log('🛒 Processing charge.success event');
    const data = event.data;
    const meta = data.metadata;
    console.log('📦 Session metadata:', meta);

    // Validate userId exists and is not empty
    if (!meta?.userId || meta.userId.trim() === '') {
      return new NextResponse('Missing user ID - order cannot be processed', { status: 400 });
    }

    if (!meta?.cartItems || !meta.totalAmount || !meta.customerEmail) {
      return new NextResponse('Missing required metadata', { status: 400 });
    }

    const cartItems = JSON.parse(meta.cartItems);
    const specifications = meta.specifications ? JSON.parse(meta.specifications) : {};
    const totalAmount = parseFloat(meta.totalAmount);

    if (!Array.isArray(cartItems) || cartItems.length === 0 || isNaN(totalAmount)) {
      throw new Error('Invalid cart items or total amount');
    }

    const existingOrder = await prisma.order.findFirst({
      where: { paymentIntentId: data.reference },
    });

    if (existingOrder) {
      return new NextResponse('Already processed', { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      console.log('💾 Creating order with data:', {
        userId: meta.userId,
        email: meta.customerEmail,
        customerName: meta.customerName,
        amount: totalAmount
      });

      const order = await tx.order.create({
        data: {
          userId: meta.userId, // ✅ Already validated above - will never be null
          email: meta.customerEmail,
          customerName: meta.customerName,
          phone: meta.customerPhone || null,
          amount: totalAmount,
          status: 'completed',
          paymentIntentId: data.reference,
        },
      });

      console.log('✅ Order created with ID:', order.id);


      for (const item of cartItems) {
        if (!item.id || !item.quantity || !item.price) {
          throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
        }

        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock error for product ${item.id}`);
        }

        const itemSpecs = specifications[item.id] || {};

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
            condition: itemSpecs.condition || null,
            storage: itemSpecs.storage || null,
            simType: itemSpecs.simType || null,
            color: itemSpecs.color || null,
          },
        });

        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    console.log('🎉 Order processing completed successfully');
    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('❌ Webhook handler failed:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}