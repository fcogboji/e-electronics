import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/authMiddleware';

// Create a new coupon (Admin only)
export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }

    const data = await request.json();
    const { code, discountType, discountValue, minPurchase, maxDiscount, usageLimit, expiresAt } = data;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { error: 'Code, discountType, and discountValue are required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minPurchase: minPurchase || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// Get all coupons (Admin only)
export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}
