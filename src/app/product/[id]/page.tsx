import { prisma } from '@/lib/prisma';
import ProductDetails from './ProductDetails';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) return <div>Product not found</div>;

 return (
  <ProductDetails
    product={{
      ...product,
      discount: product.discount ?? 0, // ensure number
     avgRating: product.avgRating ?? null, // ✅ Correct - converts to null
    }}
  />
);

}
