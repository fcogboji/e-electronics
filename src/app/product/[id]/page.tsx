// src/app/product/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import ProductDetails from './ProductDetails';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return <div>Product not found</div>;

  return (
    <ProductDetails
      product={{
        ...product,
        discount: product.discount ?? 0,
        avgRating: product.avgRating ?? null,
      }}
    />
  );
}
