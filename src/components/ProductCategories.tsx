'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Headphones, Laptop, Watch, Cable, Speaker, Battery, HardDrive } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  icon: string;
  image: string;
  order: number;
  productId?: string | null;
}

interface SponsoredProduct {
  id: string;
  title: string;
  price: string;
  discount: string | null;
  image: string;
  productId: string | null;
  order: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Cable,
  Speaker,
  Battery,
  HardDrive,
};

export default function ProductCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sponsoredProducts, setSponsoredProducts] = useState<SponsoredProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, sponsoredRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/sponsored-products'),
        ]);

        const categoriesData = await categoriesRes.json();
        const sponsoredData = await sponsoredRes.json();

        setCategories(categoriesData);
        setSponsoredProducts(sponsoredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50">
      {/* Purple Header Bar */}
      <div className="w-full h-10 bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
        <h2 className="text-white font-semibold text-lg">Products Categories</h2>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Smartphone;
            return (
              <div
                key={category.id}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => {
                  if (category.productId) {
                    router.push(`/product/${category.productId}`);
                  } else {
                    // Redirect to search page with category name
                    router.push(`/search?q=${encodeURIComponent(category.title)}`);
                  }
                }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/images/${category.image}`}
                    alt={category.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1.5 text-white">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <h3 className="font-semibold text-xs line-clamp-1">{category.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Purple Divider Bar */}
        <div className="w-full h-10 bg-gradient-to-r from-purple-600 to-purple-500 rounded mb-8 flex items-center justify-center">
          <h2 className="text-white font-semibold text-lg">Sponsored products</h2>
        </div>

        {/* Sponsored Products Section */}
        <div className="mb-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {sponsoredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  if (product.productId) {
                    router.push(`/product/${product.productId}`);
                  } else {
                    // Redirect to search page with product title
                    router.push(`/search?q=${encodeURIComponent(product.title)}`);
                  }
                }}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/images/${product.image}`}
                    alt={product.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-orange-400 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                      {product.discount}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-gray-800 text-xs mb-1 line-clamp-2 min-h-[2rem]">
                    {product.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-900">₦{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Purple Bar */}
        <div className="w-full h-8 bg-gradient-to-r from-purple-600 to-purple-500 rounded"></div>
      </div>
    </div>
  );
}
