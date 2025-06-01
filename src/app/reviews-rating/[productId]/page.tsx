import { getReviews } from '@/lib/reviews';
import RatingStats from '@/components/StarRating';
import ReviewsSection from '@/components/ReviewsSection';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function ReviewsRatingPage({ params }: PageProps) {
  const { productId } = await params;
  const { stats } = await getReviews(productId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <RatingStats stats={stats} />
      <ReviewsSection productId={productId} />
    </div>
  );
}
