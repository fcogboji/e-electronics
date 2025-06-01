import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

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
    console.error('❌ Invalid signature', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  console.log('✅ Webhook received:', event.type); // Add this

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const cartItems = JSON.parse(session.metadata?.cartItems || '[]');

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

      console.log('✅ Stock reduced.');
    } catch (err) {
      console.error('❌ Failed to reduce stock:', err);
    }
  }

  return new NextResponse('Webhook received', { status: 200 });
}
