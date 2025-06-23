// app/api/orders/[orderId]/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
        
    // 🔍 DEBUG: Log what we received
    console.log('🔍 API received orderId:', orderId);
    console.log('🔍 Full URL:', req.url);

    if (!orderId) {
      console.log('❌ No orderId provided');
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 🔍 DEBUG: Check if order exists
    console.log('🔍 Searching for order...');
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log('🔍 Order found:', !!order);
    if (order) {
      console.log('🔍 Order details:', {
        id: order.id,
        userId: order.userId,
        status: order.status,
        itemCount: order.orderItems.length
      });
    }

    if (!order) {
      console.log('❌ Order not found in database');
            
      // 🔍 DEBUG: Check if any orders exist with similar ID
      const similarOrders = await prisma.order.findMany({
        where: {
          id: {
            contains: orderId,
            mode: 'insensitive'
          }
        },
        select: { id: true, status: true },
        take: 5
      });
      console.log('🔍 Similar orders found:', similarOrders);
            
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}