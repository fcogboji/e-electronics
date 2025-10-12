import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason, details } = await req.json();
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

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to cancel this order' }, { status: 403 });
    }

    if (!['pending', 'confirmed', 'processing'].includes(order.status.toLowerCase())) {
      return NextResponse.json({
        error: 'Order cannot be cancelled at this stage'
      }, { status: 400 });
    }

    const existingCancellation = await prisma.orderCancellation.findUnique({
      where: { orderId }
    });

    if (existingCancellation) {
      return NextResponse.json({
        error: 'Cancellation request already exists'
      }, { status: 400 });
    }

    const cancellation = await prisma.orderCancellation.create({
      data: {
        orderId,
        userId: user.id,
        reason,
        details,
        status: 'PENDING'
      }
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        oldStatus: order.status,
        newStatus: 'cancellation_requested',
        changedBy: user.id,
        notes: `Cancellation requested: ${reason}`
      }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancellation_requested' }
    });

    return NextResponse.json({
      message: 'Cancellation request submitted successfully',
      cancellation
    });
  } catch (error) {
    console.error('Error creating cancellation request:', error);
    return NextResponse.json({ error: 'Failed to submit cancellation request' }, { status: 500 });
  }
}