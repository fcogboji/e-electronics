// app/product-category/brands/[brand]/page.tsx

import { getProductsByBrand } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Metadata } from "next";

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);

  return {
    title: `${decodedBrand} Products | YourSiteName`,
    description: `Discover top ${decodedBrand} products available at YourSiteName. Shop high-quality electronics, appliances, and more from ${decodedBrand}.`,
    openGraph: {
      title: `${decodedBrand} Products | YourSiteName`,
      description: `Browse the latest and best ${decodedBrand} products available in our store.`,
      url: `https://www.yoursite.com/product-category/brands/${decodedBrand}`,
      siteName: "YourSiteName",
      images: [
        {
          url: `https://www.yoursite.com/images/brands/${decodedBrand.toLowerCase()}.jpg`,
          width: 800,
          height: 600,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${decodedBrand} Products | YourSiteName`,
      description: `Find great deals on ${decodedBrand} products.`,
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const products = await getProductsByBrand(decodedBrand);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 capitalize">{decodedBrand} Products</h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No products found for <span className="font-medium">{decodedBrand}</span>.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
