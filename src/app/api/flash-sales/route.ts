import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint for flash sales (no admin auth required)
export async function GET() {
  try {
    const flashSales = await prisma.flashSale.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });

    // Verify that products exist
    const flashSalesWithValidProducts = await Promise.all(
      flashSales.map(async (sale) => {
        const product = await prisma.product.findUnique({
          where: { id: sale.productId }
        });

        return {
          ...sale,
          productId: product ? product.id : sale.productId,
          productExists: !!product
        };
      })
    );

    // Only return flash sales where the product exists
    const validFlashSales = flashSalesWithValidProducts.filter(sale => sale.productExists);

    return NextResponse.json(validFlashSales);
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error to prevent frontend crash
  }
}
