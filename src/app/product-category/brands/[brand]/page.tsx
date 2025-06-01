// app/product-category/brands/[brand]/page.tsx

import { getProductsByBrand } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const brand = decodeURIComponent(params.brand);
  return {
    title: `${brand} Products | YourSiteName`,
    description: `Discover top ${brand} products available at YourSiteName. Shop high-quality electronics, appliances, and more from ${brand}.`,
    openGraph: {
      title: `${brand} Products | YourSiteName`,
      description: `Browse the latest and best ${brand} products available in our store.`,
      url: `https://www.yoursite.com/product-category/brands/${brand}`,
      siteName: 'YourSiteName',
      images: [
        {
          url: `https://www.yoursite.com/images/brands/${brand.toLowerCase()}.jpg`,
          width: 800,
          height: 600,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand} Products | YourSiteName`,
      description: `Find great deals on ${brand} products.`,
    },
  };
}

export default async function BrandPage({ params }: { params: { brand: string } }) {
  const brand = decodeURIComponent(params.brand);
  const products = await getProductsByBrand(brand);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {brand} Products
      </h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No products found for <span className="font-medium">{brand}</span>.
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
