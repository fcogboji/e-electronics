// src/app/api/cancel-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}