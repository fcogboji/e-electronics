import { prisma } from '@/lib/prisma';

async function main() {
  console.log('🌱 Seeding product variants...');

  // Get all products
  const products = await prisma.product.findMany({
    where: {
      category: {
        in: ['Phones & Tablets', 'Computing']
      }
    }
  });

  console.log(`Found ${products.length} products to add variants for`);

  // Variant configurations
  const conditions = [
    { name: 'Fair', priceMultiplier: 1.0 },
    { name: 'Good', priceMultiplier: 1.1 },
    { name: 'Excellent', priceMultiplier: 1.2 },
    { name: 'Premium', priceMultiplier: 1.3 }
  ];

  const storageOptions = [
    { name: '128 GB', priceMultiplier: 1.0 },
    { name: '256 GB', priceMultiplier: 1.2 },
    { name: '512 GB', priceMultiplier: 1.4 }
  ];

  const simTypes = [
    'eSIM',
    'Physical SIM + eSIM'
  ];

  const colors = [
    'Black',
    'Grey',
    'Silver'
  ];

  for (const product of products) {
    console.log(`\n📱 Processing: ${product.name}`);

    // Delete existing variants and images
    await prisma.productVariant.deleteMany({
      where: { productId: product.id }
    });
    await prisma.productImage.deleteMany({
      where: { productId: product.id }
    });

    const variantsToCreate = [];
    const imagesToCreate = [];

    // Create variants for smartphones
    if (product.category === 'Phones & Tablets') {
      for (const condition of conditions) {
        for (const storage of storageOptions) {
          for (const simType of simTypes) {
            for (const color of colors) {
              // Calculate stock - make some variants out of stock
              const isOutOfStock = Math.random() < 0.2; // 20% chance of being out of stock
              const stock = isOutOfStock ? 0 : Math.floor(Math.random() * 10) + 1;

              // Calculate price adjustment based on condition and storage
              const conditionPriceAdjustment = Math.floor(product.price * (condition.priceMultiplier - 1));
              const storagePriceAdjustment = Math.floor((product.price + conditionPriceAdjustment) * (storage.priceMultiplier - 1));
              const totalPriceAdjustment = conditionPriceAdjustment + storagePriceAdjustment;

              variantsToCreate.push({
                productId: product.id,
                condition: condition.name,
                storage: storage.name,
                simType: simType,
                color: color,
                stock: stock,
                priceAdjustment: totalPriceAdjustment,
                isAvailable: stock > 0
              });
            }
          }
        }
      }
    }
    // Create variants for laptops (no SIM type needed)
    else if (product.category === 'Computing') {
      for (const condition of conditions) {
        for (const storage of storageOptions) {
          for (const color of colors) {
            // Calculate stock - make some variants out of stock
            const isOutOfStock = Math.random() < 0.15; // 15% chance of being out of stock for laptops
            const stock = isOutOfStock ? 0 : Math.floor(Math.random() * 5) + 1;

            // Calculate price adjustment
            const conditionPriceAdjustment = Math.floor(product.price * (condition.priceMultiplier - 1));
            const storagePriceAdjustment = Math.floor((product.price + conditionPriceAdjustment) * (storage.priceMultiplier - 1));
            const totalPriceAdjustment = conditionPriceAdjustment + storagePriceAdjustment;

            variantsToCreate.push({
              productId: product.id,
              condition: condition.name,
              storage: storage.name,
              simType: null, // Laptops don't have SIM type
              color: color,
              stock: stock,
              priceAdjustment: totalPriceAdjustment,
              isAvailable: stock > 0
            });
          }
        }
      }
    }

    // Batch create variants
    if (variantsToCreate.length > 0) {
      await prisma.productVariant.createMany({
        data: variantsToCreate
      });
      console.log(`  ✅ Created ${variantsToCreate.length} variants`);
    }

    // Create product images for each color
    const baseImageName = product.image?.replace(/\.(jpg|jpeg|png|webp)$/i, '') || '';
    const extension = product.image?.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';

    const colorMapping: Record<string, string> = {
      'Black': 'b',
      'Grey': 'grey',
      'Silver': 's'
    };

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const colorSuffix = colorMapping[color] || color.toLowerCase();
      const imageUrl = `/images/${baseImageName}${colorSuffix}${extension}`;

      imagesToCreate.push({
        productId: product.id,
        imageUrl: imageUrl,
        color: color,
        isPrimary: i === 0, // First image is primary
        order: i
      });
    }

    // Batch create images
    if (imagesToCreate.length > 0) {
      await prisma.productImage.createMany({
        data: imagesToCreate
      });
      console.log(`  ✅ Created ${imagesToCreate.length} product images`);
    }
  }

  console.log('\n✅ Product variants seeded successfully');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
