export const dynamic = 'force-dynamic'; // 👈 add this

import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';
import BrandCarousel from "@/components/BrandCarousel";



export default async function HomePage() {
  const products = await prisma.product.findMany();

  return (
    <>
      <BrandCarousel />
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              discount: product.discount ?? 0,
            }}
          />
        ))}
      </div>
    </>
  );
}
