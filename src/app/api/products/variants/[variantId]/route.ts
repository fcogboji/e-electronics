import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update a specific variant
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { variantId } = await params;
  try {
    const data = await request.json();

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        condition: data.condition,
        storage: data.storage,
        simType: data.simType,
        color: data.color,
        stock: data.stock,
        priceAdjustment: data.priceAdjustment,
        isAvailable: data.isAvailable,
      },
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific variant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { variantId } = await params;
  try {
    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}
