'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
}

interface ReviewsListProps {
  productId: string;
  refreshTrigger: number;
}

export default function ReviewsList({ productId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRating, setEditedRating] = useState(5);
  const [editedComment, setEditedComment] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    };
    fetchReviews();
  }, [productId, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const res = await fetch(`/api/review/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditedRating(review.rating);
    setEditedComment(review.comment);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedComment('');
    setEditedRating(5);
  };

  const handleSave = async (id: string) => {
    const res = await fetch(`/api/review/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: editedRating,
        comment: editedComment,
      }),
    });

    if (res.ok) {
      const updatedReview = await res.json();
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? updatedReview : r))
      );
      handleCancel();
    } else {
      alert('Failed to update review');
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {reviews.map((review) => (
        <div key={review.id} className="border border-yellow-400 bg-yellow-50 p-4 rounded-xl shadow-sm">
          {editingId === review.id ? (
            <>
              <label className="block text-yellow-700 font-semibold">
                Rating (1–5):
              </label>
              <input
                type="number"
                value={editedRating}
                min={1}
                max={5}
                onChange={(e) => setEditedRating(Number(e.target.value))}
                className="w-full mb-2 rounded border border-yellow-300 px-2 py-1"
              />
              <textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className="w-full mb-2 rounded border border-yellow-300 px-2 py-1"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(review.id)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="text-yellow-700 underline"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-yellow-600">
                Rating: {review.rating} / 5
              </p>
              <p className="text-gray-800">{review.comment}</p>
              <p className="text-sm text-yellow-600">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
              {user?.id === review.userId && (
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-yellow-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
