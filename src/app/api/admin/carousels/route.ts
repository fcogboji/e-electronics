import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/authMiddleware';

// GET - Get carousel assignments for a product
export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          isLivePromo: true,
          isFeatured: true,
          isLaptop: true,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(product);
    }

    // Get all products with carousel status
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
        isLivePromo: true,
        isFeatured: true,
        isLaptop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching carousel data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel data' },
      { status: 500 }
    );
  }
}

// POST - Update carousel assignments for a product
export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const body = await request.json();
    const { productId, isLivePromo, isFeatured, isLaptop } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        isLivePromo: isLivePromo ?? false,
        isFeatured: isFeatured ?? false,
        isLaptop: isLaptop ?? false,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating carousel assignments:', error);
    return NextResponse.json(
      { error: 'Failed to update carousel assignments' },
      { status: 500 }
    );
  }
}

// PATCH - Bulk update carousel assignments
export async function PATCH(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const body = await request.json();
    const { productIds, carouselType, value } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    if (!carouselType || !['isLivePromo', 'isFeatured', 'isLaptop'].includes(carouselType)) {
      return NextResponse.json(
        { error: 'Valid carousel type is required (isLivePromo, isFeatured, or isLaptop)' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    updateData[carouselType] = value ?? true;

    await prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${productIds.length} products`
    });
  } catch (error) {
    console.error('Error bulk updating carousel assignments:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update carousel assignments' },
      { status: 500 }
    );
  }
}