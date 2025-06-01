
// =============================================================================
// 10. UTILITY HOOKS (create: hooks/useReviews.ts in project root)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { ReviewData, RatingStats } from '@/types/review';

// Custom hook for managing reviews data
export function useReviews(productId: string) {
  // State for reviews data
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch reviews from API
  const fetchReviews = async () => {
    try {
      setIsLoading(true);  // Show loading state
      setError(null);      // Clear previous errors

      // Make API request
      const response = await fetch(`/api/reviews/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews);  // Update reviews
      setStats(data.stats);      // Update statistics

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  // Function to add a new review optimistically
  const addReview = (newReview: ReviewData) => {
    setReviews(prev => [newReview, ...prev]); // Add to beginning of array
    // Update stats optimistically (simplified)
    if (stats) {
      const newTotalReviews = stats.totalReviews + 1;
      const newAvgRating = ((stats.averageRating * stats.totalReviews) + newReview.rating) / newTotalReviews;
      
      setStats({
        ...stats,
        totalReviews: newTotalReviews,
        averageRating: newAvgRating,
        ratingDistribution: {
          ...stats.ratingDistribution,
          [newReview.rating as keyof typeof stats.ratingDistribution]: 
            stats.ratingDistribution[newReview.rating as keyof typeof stats.ratingDistribution] + 1
        }
      });
    }
  };

  // Function to remove a review optimistically
  const removeReview = (reviewId: string) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
    // You could also update stats here for better UX
  };

  // Fetch reviews on mount and when productId changes
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Return hook data and functions
  return {
    reviews,
    stats,
    isLoading,
    error,
    fetchReviews,    // Manual refresh function
    addReview,       // Optimistic add function
    removeReview,    // Optimistic remove function
  };
}
