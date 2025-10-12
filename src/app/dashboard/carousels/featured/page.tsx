'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, Search, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  isLivePromo: boolean;
  isFeatured: boolean;
  isLaptop: boolean;
}

export default function FeaturedManager() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/carousels');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, currentValue: boolean) => {
    setUpdating(productId);
    try {
      const response = await fetch('/api/admin/carousels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          isFeatured: !currentValue,
        }),
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredProducts = filteredProducts.filter(p => p.isFeatured);
  const otherProducts = filteredProducts.filter(p => !p.isFeatured);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Featured/Trending Manager
            </h1>
          </div>
          <p className="text-gray-600">
            Manage products displayed in the Featured/Trending carousel
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 rounded-lg shadow-sm">
            <p className="text-sm text-white/90 mb-1">In Featured Carousel</p>
            <p className="text-3xl font-bold text-white">{featuredProducts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Not in Carousel</p>
            <p className="text-3xl font-bold text-gray-900">{otherProducts.length}</p>
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            In Featured/Trending Carousel ({featuredProducts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 mb-3 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.image.startsWith('http') || product.image.startsWith('/images')
                      ? product.image
                      : `/images/${product.image}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-purple-600 mb-3">
                  ₦{(product.price / 100).toLocaleString()}
                </p>
                <button
                  onClick={() => toggleFeatured(product.id, product.isFeatured)}
                  disabled={updating === product.id}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Remove from Featured
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Other Products */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Available Products ({otherProducts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 mb-3 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.image.startsWith('http') || product.image.startsWith('/images')
                      ? product.image
                      : `/images/${product.image}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-gray-900 mb-3">
                  ₦{(product.price / 100).toLocaleString()}
                </p>
                <button
                  onClick={() => toggleFeatured(product.id, product.isFeatured)}
                  disabled={updating === product.id}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  Add to Featured
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}