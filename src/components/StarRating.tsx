import React from 'react';

interface RatingStatsProps {
  stats: {
    averageRating: number;
    ratingDistribution: { [key: number]: number };
    totalReviews: number;
  };
}

export default function RatingStats({ stats }: RatingStatsProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Average Rating: {stats.averageRating.toFixed(1)} / 5</h3>
      <p>Total Reviews: {stats.totalReviews}</p>
      <div className="space-y-1 mt-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center">
            <span className="w-12 text-sm">{star} stars</span>
            <progress className="flex-1 mx-2" value={stats.ratingDistribution[star] || 0} max={stats.totalReviews} />
            <span className="w-6 text-sm">{stats.ratingDistribution[star] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
