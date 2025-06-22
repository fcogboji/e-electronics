import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET /api/products?query=samsung — fetch filtered products
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim() || '';

    const products = await prisma.product.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined, // If no query, return all products
      include: {
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products — create new product (admin-only)
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (userId !== process.env.NEXT_PUBLIC_ADMIN_ID) {
      console.error('❌ Unauthorized user:', userId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        image: body.image,
        description: body.description,
        price: body.price,
        stock: body.stock,
        category: body.category,
        discount: body.discount ?? 0,
        brand: body.brand ?? 'Generic',
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    );
  }
}
