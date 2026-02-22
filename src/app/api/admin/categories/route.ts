import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorizedResponse } from '@/lib/authMiddleware';

// GET all categories
export async function GET() {
  try {
    // Admin auth check
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const categories = await prisma.productCategory.findMany({
      orderBy: { order: 'asc' },
    });

    // Validate that productIds exist and filter out invalid ones
    const validatedCategories = await Promise.all(
      categories.map(async (category) => {
        if (category.productId) {
          const exists = await prisma.product.findUnique({
            where: { id: category.productId },
            select: { id: true },
          });
          return exists ? category : null;
        }
        return category;
      })
    );

    // Filter out null values (categories with invalid productIds)
    const filteredCategories = validatedCategories.filter(Boolean);

    return NextResponse.json(filteredCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const body = await request.json();
    const { title, icon, image, price, productId, order } = body;

    if (!title || !icon || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const category = await prisma.productCategory.create({
      data: {
        title,
        icon,
        image,
        price: price || null,
        productId: productId || null,
        order: order || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT update category
export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const body = await request.json();
    const { id, title, icon, image, price, productId, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(icon && { icon }),
        ...(image && { image }),
        ...(price !== undefined && { price }),
        ...(productId !== undefined && { productId }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return unauthorizedResponse('Admin access required');
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await prisma.productCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
