import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/search?q=searchterm&category=...&brand=...&minPrice=...&maxPrice=...&sortBy=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const inStock = searchParams.get('inStock') === 'true';

    // Build where clause dynamically
    const whereConditions: any[] = [];

    // Search query
    if (q) {
      whereConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Category filter
    if (category) {
      whereConditions.push({ category });
    }

    // Brand filter
    if (brand) {
      whereConditions.push({ brand });
    }

    // Price range
    if (minPrice) {
      whereConditions.push({ price: { gte: parseInt(minPrice) } });
    }
    if (maxPrice) {
      whereConditions.push({ price: { lte: parseInt(maxPrice) } });
    }

    // Stock filter
    if (inStock) {
      whereConditions.push({ stock: { gt: 0 } });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Get total count
    const total = await prisma.product.count({ where });

    // Determine sort field
    let orderBy: any;
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'avgRating':
        orderBy = { avgRating: sortOrder };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { isAvailable: true, stock: { gt: 0 } },
          take: 5,
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    // Calculate ratings
    const productsWithRatings = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : product.avgRating || 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.totalReviews || product.reviews.length,
        reviews: undefined,
      };
    });

    // Get available filters (unique brands, categories, price range)
    const [brands, categories, priceRange] = await Promise.all([
      prisma.product.findMany({
        where,
        select: { brand: true },
        distinct: ['brand'],
      }),
      prisma.product.findMany({
        where,
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return NextResponse.json({
      products: productsWithRatings,
      total,
      hasMore: offset + limit < total,
      query: q,
      filters: {
        brands: brands.map(b => b.brand).sort(),
        categories: categories.map(c => c.category).sort(),
        priceRange: {
          min: priceRange._min.price || 0,
          max: priceRange._max.price || 0,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}