import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all sponsored products
export async function GET() {
  try {
    const sponsoredProducts = await prisma.sponsoredProduct.findMany({
      orderBy: { order: 'asc' },
    });

    // Validate that productIds exist and filter out invalid ones
    const validatedProducts = await Promise.all(
      sponsoredProducts.map(async (product) => {
        if (product.productId) {
          const exists = await prisma.product.findUnique({
            where: { id: product.productId },
            select: { id: true },
          });
          return exists ? product : null;
        }
        return product;
      })
    );

    // Filter out null values (products with invalid productIds)
    const filteredProducts = validatedProducts.filter(Boolean);

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsored products' }, { status: 500 });
  }
}

// POST new sponsored product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, discount, image, productId, order, active } = body;

    if (!title || !price || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sponsoredProduct = await prisma.sponsoredProduct.create({
      data: {
        title,
        price,
        discount: discount || null,
        image,
        productId: productId || null,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(sponsoredProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsored product:', error);
    return NextResponse.json({ error: 'Failed to create sponsored product' }, { status: 500 });
  }
}

// PUT update sponsored product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, price, discount, image, productId, order, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Sponsored product ID is required' }, { status: 400 });
    }

    const sponsoredProduct = await prisma.sponsoredProduct.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(price && { price }),
        ...(discount !== undefined && { discount }),
        ...(image && { image }),
        ...(productId !== undefined && { productId }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(sponsoredProduct);
  } catch (error) {
    console.error('Error updating sponsored product:', error);
    return NextResponse.json({ error: 'Failed to update sponsored product' }, { status: 500 });
  }
}

// DELETE sponsored product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Sponsored product ID is required' }, { status: 400 });
    }

    await prisma.sponsoredProduct.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Sponsored product deleted successfully' });
  } catch (error) {
    console.error('Error deleting sponsored product:', error);
    return NextResponse.json({ error: 'Failed to delete sponsored product' }, { status: 500 });
  }
}
