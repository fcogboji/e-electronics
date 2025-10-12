import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.warn('Missing Paystack signature');
      return new Response('Unauthorized', { status: 401 });
    }

    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Paystack webhook secret not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    // Verify signature using HMAC SHA512
    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
      console.warn('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    // Parse the verified webhook payload
    const event = JSON.parse(rawBody);

    console.log('Paystack webhook event:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
      case 'transaction.success':
        await handleSuccessfulPayment(event.data);
        break;

      case 'charge.failed':
      case 'transaction.failed':
        console.log('Payment failed:', event.data.reference);
        // Optionally handle failed payments
        break;

      default:
        console.log('Unhandled event type:', event.event);
    }

    // Respond quickly to Paystack
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, customer, metadata, paid_at, channel, currency } = data;

    // Parse metadata
    const cartItems = metadata?.cartItems ? JSON.parse(metadata.cartItems) : [];
    const specifications = metadata?.specifications ? JSON.parse(metadata.specifications) : {};
    const userId = metadata?.userId;

    if (!cartItems || cartItems.length === 0) {
      console.error('No cart items in webhook metadata');
      return;
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { paymentReference: reference },
    });

    if (existingOrder) {
      console.log('Order already processed:', reference);
      return;
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: userId || customer.email,
        email: customer.email,
        amount: amount / 100, // Convert from kobo to naira for storage
        status: 'PAID',
        paymentReference: reference,
        paymentChannel: channel,
        customerEmail: customer.email,
        customerName: metadata?.customerName || customer.email,
        paidAt: new Date(paid_at),
        orderItems: {
          create: cartItems.map((item: any) => {
            const itemSpecs = specifications[item.id] || {};
            return {
              productId: item.id,
              productName: item.name,
              productImage: item.image,
              price: item.price / 100, // Convert from kobo to naira
              quantity: item.quantity,
              specifications: JSON.stringify(itemSpecs),
              condition: itemSpecs.condition,
              storage: itemSpecs.storage,
              simType: itemSpecs.simType,
              color: itemSpecs.color,
            };
          }),
        },
      },
      include: {
        orderItems: true,
      },
    });

    console.log('Order created successfully:', order.id);

    // Reduce product inventory
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Send order confirmation email
    await sendOrderConfirmationEmail({
      to: customer.email,
      customerName: metadata?.customerName || customer.email,
      orderId: order.id,
      orderItems: order.orderItems.map((item) => ({
        productName: item.productName || 'Product',
        quantity: item.quantity,
        price: item.price * 100, // Convert back to kobo for email display
      })),
      totalAmount: amount,
      paymentReference: reference,
    });

    console.log('Inventory updated and email sent for order:', order.id);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}
