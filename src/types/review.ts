
// =============================================================================
// 2. TYPES AND INTERFACES (create: types/review.ts in project root)
// =============================================================================

// Interface for creating a new review
export interface CreateReviewData {
  rating: number;      // Rating value from 1-5
  comment?: string;    // Optional comment text
  productId: string;   // Product being reviewed
}

// Interface for review data returned from API
export interface ReviewData {
  id: string;          // Unique review identifier
  rating: number;      // Star rating (1-5)
  comment: string | null; // Review comment (can be null)
  userId: string;      // Clerk user ID of reviewer
  productId: string;   // Product ID being reviewed
  createdAt: Date;     // When review was created
  updatedAt: Date;     // When review was last updated
  userName?: string;   // User's display name (if available)
  userImage?: string;  // User's profile image (if available)
}

// Interface for aggregated rating statistics
export interface RatingStats {
  averageRating: number;    // Average rating (0-5)
  totalReviews: number;     // Total number of reviews
  ratingDistribution: {     // Breakdown by star rating
    1: number;              // Count of 1-star reviews
    2: number;              // Count of 2-star reviews
    3: number;              // Count of 3-star reviews
    4: number;              // Count of 4-star reviews
    5: number;              // Count of 5-star reviews
  };
}