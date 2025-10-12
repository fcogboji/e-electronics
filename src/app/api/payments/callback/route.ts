import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  // Use either reference or trxref (Paystack uses both)
  const paymentReference = reference || trxref;

  if (!paymentReference) {
    return NextResponse.redirect(
      new URL('/checkout?error=missing_reference', request.url)
    );
  }

  try {
    // Verify the payment on the server
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: paymentReference }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      // Redirect to success page with order ID
      return NextResponse.redirect(
        new URL(
          `/order-confirmation?ref=${paymentReference}&orderId=${verifyData.data.orderId}`,
          request.url
        )
      );
    } else {
      // Redirect to failure page
      return NextResponse.redirect(
        new URL(`/checkout?error=payment_failed`, request.url)
      );
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      new URL('/checkout?error=verification_failed', request.url)
    );
  }
}
