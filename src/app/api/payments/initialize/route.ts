import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, cartItems, specifications } = body;

    if (!email || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email and cart items are required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error('Paystack secret key not found');
      return NextResponse.json(
        { success: false, error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Calculate total amount in kobo (Paystack expects amounts in subunits)
    const totalAmount = cartItems.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );

    // Initialize transaction with Paystack
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: totalAmount, // Already in kobo from frontend
          currency: 'NGN',
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
          metadata: {
            userId,
            cartItems: JSON.stringify(cartItems),
            specifications: JSON.stringify(specifications),
            custom_fields: [
              {
                display_name: 'Email',
                variable_name: 'email',
                value: email,
              },
            ],
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack initialization error:', paystackData);
      return NextResponse.json(
        { success: false, error: 'Failed to initialize payment', details: paystackData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
