// File: /app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { env } from '@/lib/env';

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

    // Validate user ID exists and is not empty
    if (!user.id || user.id.trim() === '') {
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

    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return sum + price * item.quantity;
    }, 0);

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerInfo?.email || user.emailAddresses?.[0]?.emailAddress,
        amount: Math.round(totalAmount * 100), // Convert to kobo/cents
        currency: 'GBP',
        metadata: {
          cartItems: JSON.stringify(cartItems),
          totalAmount: totalAmount.toFixed(2),
          customerEmail: customerInfo?.email ?? user.emailAddresses?.[0]?.emailAddress ?? '',
          customerName: customerInfo?.name ?? `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          customerPhone: customerInfo?.phone ?? '',
          userId: user.id,
          clerkUserId: user.id,
        },
        callback_url: `${req.nextUrl.origin}/success`,
        cancel_action: `${req.nextUrl.origin}/cart`,
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    return NextResponse.json({ sessionUrl: paystackData.data.authorization_url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}