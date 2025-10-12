
// =============================================================================
// 12. DATABASE SEED SCRIPT (create: scripts/seed-reviews.ts in project root)
// =============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// No sample reviews - ready for real data
const sampleReviews: any[] = [];

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