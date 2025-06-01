// app/api/reviews/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

type RatingStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> } // ✅ Changed to Promise
) {
  try {
    const { productId } = await params; // ✅ Added await here
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const reviewsWithUserData = await Promise.all(
      reviews.map(async (review) => {
        try {
          const user = await (await clerkClient()).users.getUser(review.userId);
          
          return {
            ...review,
            userName: user.firstName || user.username || 'Anonymous',
            userImage: user.imageUrl,
          };
        } catch (error) {
          console.error('Error fetching user data:', error);
          return {
            ...review,
            userName: 'Anonymous',
            userImage: null,
          };
        }
      })
    );

    const ratingStats = calculateRatingStats(reviews);

    return NextResponse.json({
      reviews: reviewsWithUserData,
      stats: ratingStats,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

function calculateRatingStats(reviews: any[]): RatingStats {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating as keyof typeof dist]++;
    return dist;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution,
  };
}