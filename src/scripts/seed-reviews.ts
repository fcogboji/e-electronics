
// =============================================================================
// 12. DATABASE SEED SCRIPT (create: scripts/seed-reviews.ts in project root)
// =============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample review data for testing
const sampleReviews = [
  {
    rating: 5,
    comment: "Excellent product! Exactly what I was looking for. Fast shipping and great quality.",
    userId: "user_sample_1", // Replace with actual Clerk user IDs
    productId: "product_1",  // Replace with actual product IDs
  },
  {
    rating: 4,
    comment: "Very good product, minor issues with packaging but overall satisfied.",
    userId: "user_sample_2",
    productId: "product_1",
  },
  {
    rating: 5,
    comment: "Outstanding quality and customer service. Highly recommend!",
    userId: "user_sample_3",
    productId: "product_1",
  },
  {
    rating: 3,
    comment: "Product is okay, but not quite what I expected. Could be better.",
    userId: "user_sample_4",
    productId: "product_1",
  },
  {
    rating: 4,
    comment: "Good value for money. Would buy again.",
    userId: "user_sample_5",
    productId: "product_1",
  },
];

// Function to seed sample reviews
async function seedReviews() {
  console.log('Starting to seed reviews...');

  try {
    // Create sample reviews
    for (const reviewData of sampleReviews) {
      await prisma.review.create({
        data: reviewData,
      });
      console.log(`Created review for product ${reviewData.productId}`);
    }

    // Update product rating statistics
    const products = await prisma.product.findMany({
      include: {
        reviews: true, // Include reviews to calculate stats
      },
    });

   for (const product of products) {
  if (product.reviews.length > 0) {
    const totalRating = product.reviews.reduce(
      (sum: number, review: { rating: number }) => sum + review.rating,
      0
    );
    const avgRating = totalRating / product.reviews.length;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: product.reviews.length,
      },
    });

    console.log(`Updated stats for product ${product.id}: ${avgRating.toFixed(1)} avg, ${product.reviews.length} reviews`);
  }
}


    console.log('✅ Reviews seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
  } finally {
    await prisma.$disconnect(); // Close database connection
  }
}

// Run the seed function
seedReviews();