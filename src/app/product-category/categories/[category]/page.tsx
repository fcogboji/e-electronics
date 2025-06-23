import { getProductsByCategory } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  return {
    title: `${decodedCategory} Products | YourSiteName`,
    description: `Discover top ${decodedCategory} products available at YourSiteName.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  // Optional: convert slug to category name if needed
  // const normalizedCategory = slugToCategory(decodedCategory);

  const products = await getProductsByCategory(decodedCategory);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 capitalize">{decodedCategory} Products</h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No products found for <span className="font-medium">{decodedCategory}</span>.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}