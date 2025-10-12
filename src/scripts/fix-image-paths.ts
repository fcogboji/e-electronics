import { prisma } from '@/lib/prisma';

async function fixImagePaths() {
  try {
    // Get all products
    const products = await prisma.product.findMany();

    console.log(`Found ${products.length} products to check...`);

    let updatedCount = 0;

    for (const product of products) {
      // Check if image path needs fixing
      // Skip if already has /images/ or is an external URL
      if (
        product.image &&
        !product.image.startsWith('http') &&
        !product.image.startsWith('/images/')
      ) {
        const newImagePath = `/images/${product.image}`;

        await prisma.product.update({
          where: { id: product.id },
          data: { image: newImagePath },
        });

        console.log(`✅ Updated: ${product.name}`);
        console.log(`   Old: ${product.image}`);
        console.log(`   New: ${newImagePath}`);
        updatedCount++;
      }
    }

    console.log(`\n✨ Done! Updated ${updatedCount} product(s)`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImagePaths();
