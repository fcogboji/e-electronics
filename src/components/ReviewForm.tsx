"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Updated props type to include onReviewSubmitted
type ReviewFormProps = {
  productId: string;
  onReviewSubmitted: () => void;
};

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        rating,
        comment,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setRating(5);
      setComment("");
      router.refresh(); // Refresh the page
      onReviewSubmitted(); // ✅ Trigger refresh in parent component
    } else {
      console.error("Error submitting review");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <div>
        <label className="block font-medium">Rating (1–5)</label>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
