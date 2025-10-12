import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function fixMissingMemory() {
  console.log('Fixing missing memory specs...\n');

  // Product ID to memory mapping based on product names
  const memoryMapping: { [key: string]: string } = {
    'cmgct3of80000sbpj1a8zc1r4': '16 GB',  // Macbook Pro (generic)
    'cmgdhdjet0004sb9hij2r3ju3': '16 GB',  // MacBook Air 15" - M2 Chip - 16GB Memory
    'cmgfdxmz40005sbq65ggi9zrx': '16 GB',  // MacBook Pro 16,1/i7-9750H/16GB
  };

  for (const [productId, memory] of Object.entries(memoryMapping)) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      console.log(`❌ Product ${productId} not found`);
      continue;
    }

    console.log(`\nUpdating: ${product.name}`);
    console.log(`  Setting memory to: ${memory}`);

    let updatedCount = 0;
    for (const variant of product.variants) {
      if (!variant.memory) {
        try {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { memory }
          });
          updatedCount++;
        } catch (error) {
          console.log(`  ❌ Error updating variant ${variant.id}`);
        }
      }
    }

    console.log(`  ✅ Updated ${updatedCount} variants`);
  }

  console.log('\n✨ Done! All laptops now have memory specs.');

  await prisma.$disconnect();
}

fixMissingMemory().catch(console.error);
