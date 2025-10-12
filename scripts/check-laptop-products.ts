import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function checkLaptopProducts() {
  console.log('Checking products...\n');

  // Find all products
  const products = await prisma.product.findMany({
    include: {
      variants: true
    }
  });

  // Filter laptop products (based on category or name)
  const laptops = products.filter(p =>
    p.category?.toLowerCase().includes('laptop') ||
    p.name.toLowerCase().includes('macbook') ||
    p.name.toLowerCase().includes('laptop')
  );

  console.log(`Found ${laptops.length} laptop products:\n`);

  for (const laptop of laptops) {
    console.log(`\nProduct: ${laptop.name}`);
    console.log(`  ID: ${laptop.id}`);
    console.log(`  isLaptop flag: ${laptop.isLaptop ? '✅ true' : '❌ false'}`);
    console.log(`  Has variants: ${laptop.variants.length > 0 ? `Yes (${laptop.variants.length})` : '❌ No'}`);

    if (laptop.variants.length > 0) {
      const hasProcessor = laptop.variants.some(v => v.processor !== null);
      const hasMemory = laptop.variants.some(v => v.memory !== null);

      console.log(`  Has processor in variants: ${hasProcessor ? '✅ Yes' : '❌ No'}`);
      console.log(`  Has memory in variants: ${hasMemory ? '✅ Yes' : '❌ No'}`);

      if (hasProcessor || hasMemory) {
        console.log('  Sample variant:');
        const sampleVariant = laptop.variants.find(v => v.processor || v.memory);
        if (sampleVariant) {
          console.log(`    - Processor: ${sampleVariant.processor || 'None'}`);
          console.log(`    - Memory: ${sampleVariant.memory || 'None'}`);
        }
      }
    }
  }

  // Check if any laptop needs to be updated
  const needsUpdate = laptops.filter(l => !l.isLaptop);

  if (needsUpdate.length > 0) {
    console.log('\n\n⚠️  Products that need isLaptop flag updated:');
    needsUpdate.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id})`);
    });
  }

  await prisma.$disconnect();
}

checkLaptopProducts().catch(console.error);
