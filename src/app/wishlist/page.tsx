"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, ShoppingCart, Trash2, Package, Star } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { formatAmount } from "@/utils/format";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/stores/wishlistStore";

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    brand: string;
    category: string;
    discount?: number;
    stock: number;
    avgRating?: number;
    totalReviews: number;
  };
}

export default function WishlistPage() {
  const { user, isLoaded } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (isLoaded && user) {
      fetchWishlist();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    setRemoving(itemId);
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.id !== itemId));
        // Update the store as well
        useWishlistStore.getState().removeItem(itemId);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemoving(null);
    }
  };

  const addProductToCart = (product: WishlistItem['product']) => {
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.discount
          ? product.price - (product.price * product.discount / 100)
          : product.price,
        image: product.image,
        quantity: 1,
      });
      toast.success('Item added to cart!');
    } else {
      toast.error('This item is out of stock');
    }
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (discount) {
      return price - (price * discount / 100);
    }
    return price;
  };

  if (!isLoaded || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to View Your Wishlist</h1>
          <p className="text-gray-600">Save your favorite items for later by creating an account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Start adding items you love to your wishlist and keep track of your favorites
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Package className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/product/${item.product.id}`} className="block relative">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-48 object-contain bg-gray-50"
                />

                {item.product.discount && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {item.product.discount}% OFF
                  </div>
                )}

                {item.product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </Link>

              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {item.product.brand} • {item.product.category}
                  </span>
                </div>

                <Link href={`/product/${item.product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>

                {item.product.avgRating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(item.product.avgRating!)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({item.product.totalReviews})
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  {item.product.discount ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">
                        {formatAmount(getDiscountedPrice(item.product.price, item.product.discount))}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatAmount(item.product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">
                      {formatAmount(item.product.price)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addProductToCart(item.product)}
                    disabled={item.product.stock === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    disabled={removing === item.id}
                    className="p-2 border border-gray-300 hover:border-red-300 hover:text-red-600 text-gray-600 rounded-lg transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
