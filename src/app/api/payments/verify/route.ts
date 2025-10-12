import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
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

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    if (verifyData.status && verifyData.data.status === 'success') {
      const paymentData = verifyData.data;
      const { metadata, customer, amount, paid_at, channel } = paymentData;

      // Parse metadata
      const cartItems = metadata?.cartItems ? JSON.parse(metadata.cartItems) : [];
      const specifications = metadata?.specifications ? JSON.parse(metadata.specifications) : {};
      const userId = metadata?.userId;

      // Check if order already exists
      const existingOrder = await prisma.order.findUnique({
        where: { paymentReference: reference },
      });

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          message: 'Payment already processed',
          data: {
            orderId: existingOrder.id,
            reference: existingOrder.paymentReference,
            amount: existingOrder.amount,
            status: existingOrder.status,
          },
        });
      }

      // Verify userId exists if provided
      let validUserId = null;
      if (userId) {
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (userExists) {
          validUserId = userId;
        }
      }

      // Create order in database
      const order = await prisma.order.create({
        data: {
          userId: validUserId,
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

      console.log('Order created via verification:', order.id);

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

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: order.id,
          reference: paymentData.reference,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          paidAt: paymentData.paid_at,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment not successful' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}