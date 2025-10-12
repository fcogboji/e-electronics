import { prisma } from '@/lib/prisma';

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      image: true
    },
    take: 10
  });

  console.log('Products in database:', products.length);
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
