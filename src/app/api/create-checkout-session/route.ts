// /src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Initialize Stripe client with secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// POST handler for creating a Stripe checkout session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItems, customerInfo } = body;

    // Check if all cart items have sufficient stock before proceeding
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });

      if (!product || product.stock < item.quantity) {
        return new NextResponse(JSON.stringify({ error: `${item.name} is out of stock.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Calculate the total amount including discounts
    const totalAmount = cartItems.reduce((total: number, item: any) => {
      const finalPrice = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + finalPrice * item.quantity;
    }, 0);

    // Create a new Stripe checkout session
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
            unit_amount: Math.round(finalPrice),
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cart`,
      metadata: {
        cartItems: JSON.stringify(cartItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.discount ? item.price * (1 - item.discount / 100) : item.price,
          quantity: item.quantity,
        }))),
        totalAmount: totalAmount.toString(),
        customerEmail: customerInfo?.email || '',
        customerName: customerInfo?.name || '',
        customerPhone: customerInfo?.phone || '',
      },
      shipping_address_collection: {
        allowed_countries: ['NG', 'US', 'GB', 'CA'],
      },
      ...(customerInfo?.email ? {} : {
        customer_email: customerInfo?.email,
      }),
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
