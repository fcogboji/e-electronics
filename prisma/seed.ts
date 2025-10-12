import { prisma } from '@/lib/prisma';

async function main() {
  // Seed Product Categories
  const categories = [
    {
      title: 'Smartphones',
      icon: 'Smartphone',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      order: 0,
    },
    {
      title: 'Phone Cases & Covers',
      icon: 'Smartphone',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
      order: 1,
    },
    {
      title: 'Laptops',
      icon: 'Laptop',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      order: 2,
    },
    {
      title: 'Headphones & Earbuds',
      icon: 'Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      order: 3,
    },
    {
      title: 'Smartwatches',
      icon: 'Watch',
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=300&fit=crop',
      order: 4,
    },
    {
      title: 'Chargers & Cables',
      icon: 'Cable',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop',
      order: 5,
    },
    {
      title: 'Speakers',
      icon: 'Speaker',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop',
      order: 6,
    },
    {
      title: 'Power Banks',
      icon: 'Battery',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop',
      order: 7,
    },
  ];

  for (const category of categories) {
    await prisma.productCategory.upsert({
      where: { id: category.title },
      update: category,
      create: category,
    });
  }

  console.log('✅ Product categories seeded');

  // Seed Sponsored Products
  const sponsoredProducts = [
    {
      title: 'Samsung Galaxy S24 Ultra 256GB',
      price: '₦ 1,250,000',
      discount: '-15%',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
      order: 0,
      active: true,
    },
    {
      title: 'Apple MacBook Pro 14-inch M3',
      price: '₦ 2,890,000',
      discount: '-10%',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      order: 1,
      active: true,
    },
    {
      title: 'Sony WH-1000XM5 Wireless Headphones',
      price: '₦ 285,000',
      discount: null,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
      order: 2,
      active: true,
    },
  ];

  for (const product of sponsoredProducts) {
    await prisma.sponsoredProduct.upsert({
      where: { id: product.title },
      update: product,
      create: product,
    });
  }

  console.log('✅ Sponsored products seeded');
  console.log('✅ Seed script completed successfully');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
