import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, reason, details, items } = await req.json();

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
      return NextResponse.json({ error: 'Not authorized to return this order' }, { status: 403 });
    }

    if (!['delivered', 'completed'].includes(order.status.toLowerCase())) {
      return NextResponse.json({
        error: 'Order must be delivered before requesting a return'
      }, { status: 400 });
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        userId: user.id,
        reason,
        details,
        status: 'PENDING',
        returnItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            reason: item.reason,
            condition: item.condition
          }))
        }
      },
      include: {
        returnItems: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Return request submitted successfully',
      returnRequest
    });
  } catch (error) {
    console.error('Error creating return request:', error);
    return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const returns = await prisma.returnRequest.findMany({
      where: { userId: user.id },
      include: {
        returnItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(returns);
  } catch (error) {
    console.error('Error fetching return requests:', error);
    return NextResponse.json({ error: 'Failed to fetch return requests' }, { status: 500 });
  }
}