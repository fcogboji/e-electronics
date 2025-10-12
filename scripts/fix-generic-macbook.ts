import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function fixGenericMacbook() {
  console.log('Fixing generic "Macbook Pro" processor...\n');

  const productId = 'cmgct3of80000sbpj1a8zc1r4';

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true }
  });

  if (!product) {
    console.log('❌ Product not found');
    return;
  }

  console.log(`Updating: ${product.name}`);
  console.log(`Setting processor to: Apple M2 Pro`);

  let updatedCount = 0;
  for (const variant of product.variants) {
    if (!variant.processor) {
      try {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { processor: 'Apple M2 Pro' }
        });
        updatedCount++;
      } catch (error) {
        console.log(`❌ Error updating variant ${variant.id}`);
      }
    }
  }

  console.log(`✅ Updated ${updatedCount} variants`);
  console.log('\n✨ Done!');

  await prisma.$disconnect();
}

fixGenericMacbook().catch(console.error);
