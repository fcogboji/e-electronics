'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { Search, Filter, Grid, List, X, SlidersHorizontal } from 'lucide-react';

interface SearchResponse {
  products: Product[];
  total: number;
  query: string;
  filters?: {
    brands: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [inStock, setInStock] = useState(false);

  useEffect(() => {
    fetchSearchResults();
  }, [query, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, sortOrder, inStock]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedBrand && { brand: selectedBrand }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        sortBy,
        sortOrder,
        ...(inStock && { inStock: 'true' }),
      });

      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    inStock,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold mb-2">Search Error</div>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-gray-50 relative whitespace-nowrap"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Results bar */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {searchResults?.total || 0} product{(searchResults?.total || 0) !== 1 ? 's' : ''}
              {query && ` for "${query}"`}
            </p>
            <div className="flex items-center gap-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split('-');
                  setSortBy(newSort);
                  setSortOrder(newOrder);
                }}
                className="border rounded px-3 py-1.5 text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="avgRating-desc">Highest Rated</option>
                <option value="name-asc">Name: A-Z</option>
              </select>

              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-44">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                {/* In Stock */}
                <div className="mb-4 pb-4 border-b">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                </div>

                {/* Categories */}
                {searchResults?.filters?.categories && searchResults.filters.categories.length > 0 && (
                  <div className="mb-4 pb-4 border-b">
                    <h4 className="font-medium mb-2 text-sm">Category</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.filters.categories.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                          />
                          <span className="text-sm">{cat}</span>
                        </label>
                      ))}
                      {selectedCategory && (
                        <button onClick={() => setSelectedCategory('')} className="text-sm text-blue-600 hover:underline">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {searchResults?.filters?.brands && searchResults.filters.brands.length > 0 && (
                  <div className="mb-4 pb-4 border-b">
                    <h4 className="font-medium mb-2 text-sm">Brand</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.filters.brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="brand"
                            checked={selectedBrand === brand}
                            onChange={() => setSelectedBrand(brand)}
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                      {selectedBrand && (
                        <button onClick={() => setSelectedBrand('')} className="text-sm text-blue-600 hover:underline">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                {searchResults?.filters?.priceRange && searchResults.filters.priceRange.max > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Price Range (₦)</h4>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder={`Min (${(searchResults.filters.priceRange.min / 100).toLocaleString()})`}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder={`Max (${(searchResults.filters.priceRange.max / 100).toLocaleString()})`}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {searchResults?.products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-blue-600 hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {searchResults?.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}