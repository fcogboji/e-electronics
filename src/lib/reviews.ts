import { prisma } from '@/lib/prisma';

export async function getReviews(productId: string) {
  // ✅ Use `review` instead of `reviews`
  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });

  // Initialize distribution count
  const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  // Count ratings
  reviews.forEach((r) => {
    const rating = r.rating as 1 | 2 | 3 | 4 | 5;
    ratingDistribution[rating] += 1;
  });

  const totalReviews = reviews.length;

  // ✅ Properly type reduce parameters
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum: number, r) => sum + r.rating, 0) / totalReviews;

  return {
    reviews,
    stats: {
      totalReviews,
      averageRating,
      ratingDistribution,
    },
  };
}
