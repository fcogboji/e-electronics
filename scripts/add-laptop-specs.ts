import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Extract processor and memory from product name
function extractSpecs(productName: string): { processor: string | null; memory: string | null } {
  let processor: string | null = null;
  let memory: string | null = null;

  const name = productName.toLowerCase();

  // Extract processor
  if (name.includes('m1 pro 8-core')) {
    processor = 'Apple M1 Pro 8-core';
  } else if (name.includes('m1 pro 10-core')) {
    processor = 'Apple M1 Pro 10-core';
  } else if (name.includes('m1 max')) {
    processor = 'Apple M1 Max 10-core';
  } else if (name.includes('m2 pro')) {
    processor = 'Apple M2 Pro';
  } else if (name.includes('m2 max')) {
    processor = 'Apple M2 Max';
  } else if (name.includes('m3 pro')) {
    processor = 'Apple M3 Pro';
  } else if (name.includes('m3 max')) {
    processor = 'Apple M3 Max';
  } else if (name.includes('m3')) {
    processor = 'Apple M3';
  } else if (name.includes('m2')) {
    processor = 'Apple M2';
  } else if (name.includes('m1')) {
    processor = 'Apple M1 Pro 8-core';
  } else if (name.includes('i5-7360u') || name.includes('i5')) {
    processor = 'Intel Core i5';
  } else if (name.includes('i7-9750h') || name.includes('i7')) {
    processor = 'Intel Core i7';
  } else if (name.includes('i9')) {
    processor = 'Intel Core i9';
  }

  // Extract memory
  const memoryMatch = name.match(/(\d+)gb\s*ram/);
  if (memoryMatch) {
    memory = `${memoryMatch[1]} GB`;
  }

  return { processor, memory };
}

async function addLaptopSpecs() {
  console.log('Adding processor and memory specs to laptop variants...\n');

  // Find all laptop products
  const laptops = await prisma.product.findMany({
    where: {
      OR: [
        { category: { contains: 'laptop', mode: 'insensitive' } },
        { name: { contains: 'macbook', mode: 'insensitive' } },
        { name: { contains: 'laptop', mode: 'insensitive' } }
      ]
    },
    include: {
      variants: true
    }
  });

  console.log(`Found ${laptops.length} laptop products\n`);

  for (const laptop of laptops) {
    console.log(`\nProcessing: ${laptop.name}`);

    // First, update the isLaptop flag if not set
    if (!laptop.isLaptop) {
      await prisma.product.update({
        where: { id: laptop.id },
        data: { isLaptop: true }
      });
      console.log('  ✅ Set isLaptop flag to true');
    }

    // Extract specs from product name
    const { processor, memory } = extractSpecs(laptop.name);

    if (!processor && !memory) {
      console.log('  ⚠️  Could not extract processor/memory from product name');
      console.log('  💡 Please manually add specs for this product');
      continue;
    }

    console.log(`  Extracted specs: Processor=${processor || 'N/A'}, Memory=${memory || 'N/A'}`);

    // Update all variants for this laptop
    let updatedCount = 0;
    for (const variant of laptop.variants) {
      try {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            processor: processor,
            memory: memory
          }
        });
        updatedCount++;
      } catch (error) {
        console.log(`  ❌ Error updating variant ${variant.id}:`, error);
      }
    }

    console.log(`  ✅ Updated ${updatedCount}/${laptop.variants.length} variants`);
  }

  console.log('\n\n✨ Done! Laptop specs have been added.');
  console.log('\n💡 Note: If some laptops need different processors/memory across variants,');
  console.log('   you may need to manually update them in Prisma Studio or create new variants.');

  await prisma.$disconnect();
}

addLaptopSpecs().catch(console.error);
