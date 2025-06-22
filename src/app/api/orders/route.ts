// File: /app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // ✅ After migration, we can search by userId primarily
    // Keep email as fallback for any edge cases
    const orders = await prisma.order.findMany({
      where: { 
        OR: [
          { userId: user.id },
          { 
            AND: [
              { userId: null },
              { email: user.emailAddresses?.[0]?.emailAddress }
            ]
          }
        ]
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const totalCount = await prisma.order.count({
      where: { 
        OR: [
          { userId: user.id },
          { 
            AND: [
              { userId: null },
              { email: user.emailAddresses?.[0]?.emailAddress }
            ]
          }
        ]
      }
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ Orders API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}