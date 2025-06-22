// File: /app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface CustomerInfo {
  email?: string;
  name?: string;
  phone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to checkout.' }, { status: 401 });
    }

    // ✅ Validate user ID exists and is not empty
    if (!user.id || user.id.trim() === '') {
      console.error('❌ Invalid user ID:', user.id);
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    const { cartItems, customerInfo }: {
      cartItems: CartItem[];
      customerInfo?: CustomerInfo;
    } = await req.json();

    if (!cartItems?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate stock
    for (const item of cartItems) {
      const dbProduct = await prisma.product.findUnique({ where: { id: item.id } });
      if (!dbProduct || dbProduct.stock < item.quantity) {
        return NextResponse.json({ error: `${item.name} is out of stock` }, { status: 400 });
      }
    }

    const lineItems = cartItems.map((item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      
      return {
        price_data: {
        currency: 'GBP',
        product_data: { name: item.name },
        unit_amount: price, // ✅ ALREADY in pence
},

        quantity: item.quantity,
      };
    });

    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return sum + price * item.quantity;
    }, 0);

    // ✅ Ensure all required fields are properly set
    const metadata = {
      cartItems: JSON.stringify(cartItems),
      totalAmount: totalAmount.toFixed(2),
      customerEmail: customerInfo?.email ?? user.emailAddresses?.[0]?.emailAddress ?? '',
      customerName: customerInfo?.name ?? `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      customerPhone: customerInfo?.phone ?? '',
      userId: user.id, // ✅ Already validated above
      clerkUserId: user.id, // ✅ Add explicit clerk user ID for webhook
    };

    // ✅ Log metadata for debugging
    console.log('✅ Creating checkout session with metadata:', {
      userId: metadata.userId,
      customerEmail: metadata.customerEmail,
      totalAmount: metadata.totalAmount
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cart`,
      customer_email: customerInfo?.email || user.emailAddresses?.[0]?.emailAddress,
      shipping_address_collection: {
        allowed_countries: ['NG', 'US', 'GB', 'CA']
      },
      metadata,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('❌ create-checkout-session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}