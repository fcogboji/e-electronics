import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRefundConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { orderId, refundAmount, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
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

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.paymentReference) {
      return NextResponse.json(
        { success: false, error: 'No payment reference found for this order' },
        { status: 400 }
      );
    }

    if (order.status === 'REFUNDED') {
      return NextResponse.json(
        { success: false, error: 'Order has already been refunded' },
        { status: 400 }
      );
    }

    // Calculate refund amount (default to full order amount if not specified)
    const amountToRefund = refundAmount
      ? Math.round(refundAmount * 100) // Convert to kobo
      : Math.round(order.amount * 100);

    // Create refund via Paystack API
    const paystackResponse = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: order.paymentReference,
        amount: amountToRefund,
        merchant_note: reason || 'Customer refund request',
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack refund error:', paystackData);
      return NextResponse.json(
        {
          success: false,
          error: 'Refund failed',
          details: paystackData.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Update order status in database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'REFUNDED',
        adminNote: `Refunded ₦${(amountToRefund / 100).toLocaleString()}. Reason: ${reason || 'N/A'}`,
      },
    });

    // Restore product inventory
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Send refund confirmation email
    await sendRefundConfirmationEmail({
      to: order.customerEmail || order.email,
      customerName: order.customerName || 'Customer',
      orderId: order.id,
      refundAmount: amountToRefund,
      refundReference: paystackData.data.id || paystackData.data.transaction_reference,
    });

    console.log('Refund processed successfully:', {
      orderId,
      amount: amountToRefund,
      reference: paystackData.data.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        orderId: updatedOrder.id,
        refundAmount: amountToRefund / 100,
        refundReference: paystackData.data.id || paystackData.data.transaction_reference,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get refund status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Refund reference is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Check refund status via Paystack API
    const paystackResponse = await fetch(
      `https://api.paystack.co/refund/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch refund status' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: paystackData.data,
    });
  } catch (error) {
    console.error('Refund status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
