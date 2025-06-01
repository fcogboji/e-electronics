import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItems } = body;

    // 🔒 Step 1: Check stock before proceeding
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product || product.stock < item.quantity) {
  return new NextResponse(
    JSON.stringify({
      error: `${item.name} only has ${product?.stock || 0} in stock.`,
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}

    }

    // 💳 Step 2: Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: cartItems.map((item: any) => {
        const finalPrice = item.discount
          ? item.price * (1 - item.discount / 100)
          : item.price;

        return {
          price_data: {
            currency: 'ngn',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(finalPrice), // price in Kobo
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${req.nextUrl.origin}/success`,
      cancel_url: `${req.nextUrl.origin}/cart`,

      // ✅ Metadata to help webhook reduce stock
      metadata: {
        cartItems: JSON.stringify(cartItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
        }))),
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return new NextResponse(
      JSON.stringify({ error: 'Something went wrong during checkout' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
