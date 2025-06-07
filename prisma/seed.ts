import { prisma } from '@/lib/prisma';

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'Product 1',
        price: 10000,
        image: '/images/aircon.jpg',
        description: 'Description of product 1',
        brand: 'Brand A',
        category: 'Electronics',
        stock: 10,
      },
      {
        name: 'Product 2',
        price: 20000,
        image: '/images/ac.jpg',
        description: 'Description of product 2',
        brand: 'Brand B',
        category: 'Home',
        stock: 5,
      },
      // Add more test products here...
    ],
  });

  console.log('✅ Seeded products');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
