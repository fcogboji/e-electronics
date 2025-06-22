// File: /app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  let event: Stripe.Event;
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log(`✅ Verified webhook: ${event.id} (${event.type})`);
  } catch (err) {
    console.error('❌ Invalid Stripe signature:', err);
    return new NextResponse('Webhook signature verification failed.', { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new NextResponse('Unhandled event', { status: 200 });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;

    // ✅ Critical fix: Validate userId exists and is not empty
    if (!meta?.userId || meta.userId.trim() === '') {
      console.error('❌ Missing or empty userId in metadata:', {
        sessionId: session.id,
        metadata: meta,
        customerDetails: session.customer_details
      });
      return new NextResponse('Missing user ID - order cannot be processed', { status: 400 });
    }

    if (!meta?.cartItems || !meta.totalAmount || !meta.customerEmail) {
      console.error('❌ Missing required metadata:', {
        hasCartItems: !!meta?.cartItems,
        hasTotalAmount: !!meta?.totalAmount,
        hasCustomerEmail: !!meta?.customerEmail,
        metadata: meta
      });
      return new NextResponse('Missing required metadata', { status: 400 });
    }

    const cartItems = JSON.parse(meta.cartItems);
    const totalAmount = parseFloat(meta.totalAmount);

    if (!Array.isArray(cartItems) || cartItems.length === 0 || isNaN(totalAmount)) {
      throw new Error('Invalid cart items or total amount');
    }

    const existingOrder = await prisma.order.findFirst({
      where: { paymentIntentId: session.payment_intent as string },
    });

    if (existingOrder) {
      console.log(`⚠️ Order already exists for ${session.payment_intent}`);
      return new NextResponse('Already processed', { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: meta.userId, // ✅ Already validated above - will never be null
          email: meta.customerEmail,
          customerName: meta.customerName,
          phone: meta.customerPhone || null,
          amount: totalAmount,
          status: 'completed',
          paymentIntentId: session.payment_intent as string,
        },
      });

      console.log('✅ Order created with userId:', {
        orderId: order.id,
        userId: order.userId,
        email: order.email
      });

      for (const item of cartItems) {
        if (!item.id || !item.quantity || !item.price) {
          throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
        }

        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock error for product ${item.id}`);
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
          },
        });

        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    console.log(`✅ Order created for session ${session.id}`);
    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}