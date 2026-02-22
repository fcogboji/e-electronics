import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/authMiddleware';

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const flashSales = await prisma.flashSale.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Verify that products exist and map to correct product IDs
    const flashSalesWithValidProducts = await Promise.all(
      flashSales.map(async (sale) => {
        // Try to find the product to ensure it exists
        const product = await prisma.product.findUnique({
          where: { id: sale.productId }
        });

        return {
          ...sale,
          productId: product ? product.id : sale.productId, // Use the verified product ID
          productExists: !!product
        };
      })
    );

    return NextResponse.json(flashSalesWithValidProducts);
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flash sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const body = await request.json();

    const flashSale = await prisma.flashSale.create({
      data: {
        productId: body.productId,
        name: body.name,
        price: body.price,
        oldPrice: body.oldPrice,
        discount: body.discount,
        image: body.image,
        itemsLeft: body.itemsLeft,
        totalItems: body.totalItems,
        progress: body.progress,
        active: body.active ?? true,
        endsAt: new Date(body.endsAt)
      }
    });

    return NextResponse.json(flashSale, { status: 201 });
  } catch (error) {
    console.error('Error creating flash sale:', error);
    return NextResponse.json(
      { error: 'Failed to create flash sale' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Flash sale ID is required' },
        { status: 400 }
      );
    }

    const flashSale = await prisma.flashSale.update({
      where: { id },
      data: {
        productId: updateData.productId,
        name: updateData.name,
        price: updateData.price,
        oldPrice: updateData.oldPrice || null,
        discount: updateData.discount || null,
        image: updateData.image,
        itemsLeft: updateData.itemsLeft,
        totalItems: updateData.totalItems,
        progress: updateData.progress,
        active: updateData.active !== undefined ? updateData.active : true,
        endsAt: new Date(updateData.endsAt)
      }
    });

    return NextResponse.json(flashSale);
  } catch (error) {
    console.error('Error updating flash sale:', error);
    return NextResponse.json(
      { error: 'Failed to update flash sale' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Flash sale ID is required' },
        { status: 400 }
      );
    }

    const flashSale = await prisma.flashSale.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.endsAt && { endsAt: new Date(updateData.endsAt) })
      }
    });

    return NextResponse.json(flashSale);
  } catch (error) {
    console.error('Error updating flash sale:', error);
    return NextResponse.json(
      { error: 'Failed to update flash sale' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Flash sale ID is required' },
        { status: 400 }
      );
    }

    await prisma.flashSale.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Flash sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    return NextResponse.json(
      { error: 'Failed to delete flash sale' },
      { status: 500 }
    );
  }
}
