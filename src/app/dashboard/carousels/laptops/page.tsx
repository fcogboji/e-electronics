'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Laptop, Search, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  isLivePromo: boolean;
  isFeatured: boolean;
  isLaptop: boolean;
}

export default function LaptopsManager() {
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

  const toggleLaptop = async (productId: string, currentValue: boolean) => {
    setUpdating(productId);
    try {
      const response = await fetch('/api/admin/carousels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          isLaptop: !currentValue,
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

  const laptopProducts = filteredProducts.filter(p => p.isLaptop);
  const otherProducts = filteredProducts.filter(p => !p.isLaptop);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Laptop className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-gray-900">
              Laptops & Computers Manager
            </h1>
          </div>
          <p className="text-gray-600">
            Manage products displayed in the Laptops & Computers carousel
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-700 to-gray-900 p-6 rounded-lg shadow-sm">
            <p className="text-sm text-white/90 mb-1">In Laptops Carousel</p>
            <p className="text-3xl font-bold text-white">{laptopProducts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Not in Carousel</p>
            <p className="text-3xl font-bold text-gray-900">{otherProducts.length}</p>
          </div>
        </div>

        {/* Laptop Products */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-slate-700" />
            In Laptops Carousel ({laptopProducts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {laptopProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
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
                <p className="text-lg font-bold text-slate-700 mb-3">
                  ₦{(product.price / 100).toLocaleString()}
                </p>
                <button
                  onClick={() => toggleLaptop(product.id, product.isLaptop)}
                  disabled={updating === product.id}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                  Remove from Laptops
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
                  onClick={() => toggleLaptop(product.id, product.isLaptop)}
                  disabled={updating === product.id}
                  className="w-full bg-gradient-to-r from-slate-700 to-gray-900 hover:from-slate-800 hover:to-black text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                  Add to Laptops
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}