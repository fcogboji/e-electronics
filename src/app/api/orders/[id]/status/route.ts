import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail, type OrderStatus } from '@/lib/email';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {
      status,
      changedBy,
      notes,
      // Optional fields for email notifications
      trackingNumber,
      shippingProvider,
      estimatedDeliveryDate,
      trackingUrl,
      deliveredAt,
      cancellationReason,
      refundAmount,
      refundMethod,
      refundEta
    } = await req.json();
    const { id: orderId } = await params;

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Log status change in history
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        oldStatus: currentOrder.status,
        newStatus: status,
        changedBy,
        notes
      }
    });

    // Update order with new status and optional tracking info
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber && { trackingId: trackingNumber }),
        ...(shippingProvider && { shippingProvider }),
        ...(estimatedDeliveryDate && { deliveryEta: new Date(estimatedDeliveryDate) })
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Send email notification based on status
    const shouldSendEmail = ['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].includes(status);

    if (shouldSendEmail) {
      const emailData = {
        to: updatedOrder.email,
        customerName: updatedOrder.customerName || 'Customer',
        orderId: updatedOrder.id,
        // For confirmed status
        ...(status === 'confirmed' && {
          orderItems: updatedOrder.orderItems.map(item => ({
            productName: item.productName || item.product.name,
            quantity: item.quantity,
            price: Math.round(item.price * 100) // Convert to kobo
          })),
          totalAmount: Math.round(updatedOrder.amount * 100), // Convert to kobo
          paymentReference: updatedOrder.paymentReference || 'N/A'
        }),
        // For shipped status
        trackingNumber,
        shippingProvider,
        estimatedDeliveryDate,
        trackingUrl,
        // For delivered status
        deliveredAt,
        // For cancelled status
        cancellationReason,
        refundAmount: refundAmount ? Math.round(refundAmount * 100) : undefined, // Convert to kobo
        refundMethod,
        refundEta
      };

      try {
        await sendOrderStatusEmail(status as OrderStatus, emailData);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const statusHistory = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ order, statusHistory });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}