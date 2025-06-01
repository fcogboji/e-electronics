import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/authMiddleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: any) {
  const { id } = params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  const { id } = params;
  try {
    const userId = await authMiddleware(req);

    const body = await req.json();
    const { name, price, image, description, category, discount, stock } = body;

    if (
      !name ||
      !price ||
      !image ||
      !description ||
      !category ||
      !discount ||
      typeof stock !== 'number'
    ) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { name, price, image, description, category, discount, stock },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  const { id } = params;
  try {
    const userId = await authMiddleware(req);

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
