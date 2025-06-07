import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Initialize Stripe with latest supported API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Invalid signature:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  console.log('✅ Webhook received:', event.type);

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;
      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {
    console.error(`❌ Error handling ${event.type}:`, error);
    return new NextResponse(`Error processing ${event.type}: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }

  return new NextResponse('Webhook received', { status: 200 });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  if (event.type !== 'checkout.session.completed') return;
    const session = event.data.object as Stripe.Checkout.Session & {
      customer_details?: {
        email?: string;
        name?: string;
        phone?: string;
      };
      shipping_details?: {
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
        };
      };
    };

    try {
      console.log('🔍 Session data:', JSON.stringify(session, null, 2));
      console.log('🔍 Session metadata:', session.metadata);

      // Validate required metadata
      if (!session.metadata?.cartItems) {
        throw new Error('Missing cartItems in session metadata');
      }

      if (!session.metadata?.totalAmount) {
        throw new Error('Missing totalAmount in session metadata');
      }

      const cartItems = JSON.parse(session.metadata.cartItems);
      const totalAmount = parseFloat(session.metadata.totalAmount);

      // Validate cart items
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error('Invalid or empty cart items');
      }

      // Validate each cart item has required fields
      for (const item of cartItems) {
        if (!item.id || !item.quantity || !item.price) {
          throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
        }
      }

      console.log('🔍 Parsed cart items:', cartItems);
      console.log('🔍 Total amount:', totalAmount);

      // Validate customer information
      const customerEmail = session.customer_details?.email || session.metadata?.customerEmail;
      const customerName = session.customer_details?.name || session.metadata?.customerName;

      if (!customerEmail) {
        throw new Error('Missing customer email');
      }

      if (!customerName) {
        throw new Error('Missing customer name');
      }

      // Check if order already exists to prevent duplicates
      const existingOrder = await prisma.order.findFirst({
        where: {
          paymentIntentId: session.payment_intent as string,
        },
      });

      if (existingOrder) {
        console.log('✅ Order already exists:', existingOrder.id);
        return;
      }

      console.log('🔍 Creating order with data:', {
        email: customerEmail,
        customerName: customerName,
        phone: session.customer_details?.phone || session.metadata?.customerPhone || '',
        amount: totalAmount,
        paymentIntentId: session.payment_intent as string,
      });

      // Handle userId - only include if it's a valid user ID
      const orderData: any = {
        email: customerEmail,
        customerName: customerName,
        phone: session.customer_details?.phone || session.metadata?.customerPhone || '',
        amount: totalAmount,
        status: 'completed', // ✅ Set to completed since payment was successful
        paymentIntentId: session.payment_intent as string,
        shippingAddress: session.shipping_details?.address?.line1
          ? `${session.shipping_details.address.line1}${session.shipping_details.address.line2 ? ', ' + session.shipping_details.address.line2 : ''}`
          : null,
        city: session.shipping_details?.address?.city || null,
        state: session.shipping_details?.address?.state || null,
        postalCode: session.shipping_details?.address?.postal_code || null,
        country: session.shipping_details?.address?.country || null,
      };

      // Only add userId if it's provided and not 'anonymous'
      if (session.metadata?.userId && session.metadata.userId !== 'anonymous') {
        // Verify the user exists before adding userId
        try {
          const userExists = await prisma.user.findUnique({
            where: { id: session.metadata.userId },
            select: { id: true }
          });
          
          if (userExists) {
            orderData.userId = session.metadata.userId;
          } else {
            console.log('⚠️ User not found, creating order without userId:', session.metadata.userId);
          }
        } catch (userCheckError) {
          console.log('⚠️ Error checking user existence, creating order without userId:', userCheckError);
        }
      }

      const order = await prisma.order.create({
        data: orderData,
      });

      console.log('✅ Order created:', order.id);

      // Create order items
      for (const item of cartItems) {
        console.log('🔍 Creating order item:', item);
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }

      console.log('✅ Order items created');

      // Decrement product stock
      for (const item of cartItems) {
        console.log('🔍 Updating stock for product:', item.id);
        await prisma.product.update({
          where: { id: item.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      console.log('✅ Order created and stock updated:', order.id);
    } catch (err) {
      console.error('❌ Failed to process checkout session:', err);
      console.error('❌ Error details:', err instanceof Error ? err.message : err);
      console.error('❌ Stack trace:', err instanceof Error ? err.stack : 'No stack trace');
      throw new Error(`Failed to process checkout session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  if (event.type !== 'payment_intent.succeeded') return;
  
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  try {
    // Update order status if it exists and is still pending
    const updatedOrder = await prisma.order.updateMany({
      where: {
        paymentIntentId: paymentIntent.id,
        status: 'pending',
      },
      data: {
        status: 'completed',
      },
    });

    if (updatedOrder.count > 0) {
      console.log('✅ Order status updated to completed for payment intent:', paymentIntent.id);
    }
  } catch (err) {
    console.error('❌ Failed to update order status:', err);
    throw new Error(`Failed to update order status: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}