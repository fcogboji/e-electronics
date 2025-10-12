import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all variants for a product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: [
        { condition: 'asc' },
        { storage: 'asc' },
        { color: 'asc' },
      ],
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}

// POST - Create a new variant
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json();

    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        condition: data.condition || null,
        storage: data.storage || null,
        simType: data.simType || null,
        color: data.color || null,
        stock: data.stock || 0,
        priceAdjustment: data.priceAdjustment || 0,
        isAvailable: data.isAvailable ?? true,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete all variants for a product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    return NextResponse.json({ message: 'Variants deleted successfully' });
  } catch (error) {
    console.error('Error deleting variants:', error);
    return NextResponse.json(
      { error: 'Failed to delete variants' },
      { status: 500 }
    );
  }
}
