'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

interface ReviewsSectionProps {
  productId: string;
  className?: string;
}

export default function ReviewsSection({ productId, className = '' }: ReviewsSectionProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowReviewForm(false);
  };

  if (!userLoaded) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {showReviewForm && user && (
        <div className="border-b pb-6">
          <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
        </div>
      )}

      <ReviewsList productId={productId} refreshTrigger={refreshTrigger} />
    </div>
  );
}
