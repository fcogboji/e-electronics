'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

interface FlashSale {
  id: string;
  productId: string;
  name: string;
  price: string;
  oldPrice: string | null;
  discount: string | null;
  image: string;
  itemsLeft: number;
  totalItems: number;
  progress: number;
  active: boolean;
  endsAt: string;
  productExists?: boolean;
}

export default function FlashSalesSection() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [wishlistItems, setWishlistItems] = useState<Record<string, { isLiked: boolean; wishlistId: string | null }>>({});

  useEffect(() => {
    fetchFlashSales();
  }, []);

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user) return;

      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const response = await res.json();
          const wishlist = response.data || []; // Extract data from enterprise API response
          const wishlistMap: Record<string, { isLiked: boolean; wishlistId: string | null }> = {};
          wishlist.forEach((item: any) => {
            wishlistMap[item.productId] = { isLiked: true, wishlistId: item.id };
          });
          setWishlistItems(wishlistMap);
        }
      } catch (err) {
        console.error('Error checking wishlist:', err);
      }
    };

    if (isLoaded) {
      checkWishlist();
    }
  }, [user, isLoaded]);

  const fetchFlashSales = async () => {
    try {
      const res = await fetch('/api/admin/flash-sales');
      const data = await res.json();
      // Filter for active sales AND products that exist
      const activeFlashSales = data.filter((sale: FlashSale) => sale.active && sale.productExists !== false);
      setFlashSales(activeFlashSales);

      // Calculate time left based on first active flash sale
      if (activeFlashSales.length > 0) {
        const endTime = new Date(activeFlashSales[0].endsAt).getTime();
        updateTimeLeft(endTime);
      }
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    }
  };


  const updateTimeLeft = (endTime: number) => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleWishlistToggle = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to add items to your wishlist');
      router.push('/sign-in');
      return;
    }

    const currentState = wishlistItems[productId] || { isLiked: false, wishlistId: null };

    try {
      if (currentState.isLiked && currentState.wishlistId) {
        const res = await fetch(`/api/wishlist/${currentState.wishlistId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setWishlistItems(prev => ({
            ...prev,
            [productId]: { isLiked: false, wishlistId: null }
          }));
          toast.success('Removed from wishlist');
        } else {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (res.ok) {
          const response = await res.json();
          const data = response.data; // Extract data from enterprise API response
          setWishlistItems(prev => ({
            ...prev,
            [productId]: { isLiked: true, wishlistId: data.id }
          }));
          toast.success('Added to wishlist');
        } else {
          const error = await res.json();
          toast.error(error.error?.message || 'Failed to add to wishlist');
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      toast.error('Something went wrong');
    }
  };

  if (flashSales.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-50">
      {/* Purple Header Bar */}
      <div className="w-full h-10 bg-gradient-to-r from-purple-600 to-purple-500"></div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Flash Sales Header */}
        <div className="bg-red-600 rounded-lg p-3 sm:p-6 mb-4 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-yellow-400 rounded-lg p-1.5 sm:p-2">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 2.3a1 1 0 00-1.6 0l-7 9A1 1 0 003.5 13h4v5a1 1 0 001.6.8l7-9a1 1 0 00-.8-1.8h-4V3a1 1 0 00-.8-1z" />
              </svg>
            </div>
            <h2 className="text-white text-lg sm:text-2xl font-bold">Flash Sales</h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-white">
            <span className="text-xs sm:text-lg">Time Left:</span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-base sm:text-2xl font-bold">
              <span className="bg-white text-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-sm sm:text-2xl">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-base">h</span>
              <span className="text-xs sm:text-base">:</span>
              <span className="bg-white text-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-sm sm:text-2xl">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-base">m</span>
              <span className="text-xs sm:text-base">:</span>
              <span className="bg-white text-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-sm sm:text-2xl">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-base">s</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 mb-8">
          {flashSales.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/product/${product.productId}`)}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-32 sm:h-48 md:h-64 overflow-hidden">
                <img
                  src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/images/${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.discount && (
                  <div className="absolute top-1 right-1 sm:top-4 sm:right-4 bg-orange-400 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                    {product.discount}
                  </div>
                )}
                {/* Wishlist Button */}
                <button
                  onClick={(e) => handleWishlistToggle(product.productId, e)}
                  className="absolute top-1 left-1 sm:top-4 sm:left-4 z-10 p-1 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300"
                >
                  <Heart
                    className={`w-3 h-3 sm:w-5 sm:h-5 transition-colors duration-300 ${
                      wishlistItems[product.productId]?.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>
              <div className="p-2 sm:p-3 md:p-5">
                <h3 className="font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm md:text-base">
                  {product.name}
                </h3>
                <div className="mb-2 sm:mb-3">
                  <p className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">₦ {product.price}</p>
                  {product.oldPrice && (
                    <p className="text-xs sm:text-sm text-gray-400 line-through">₦ {product.oldPrice}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1 sm:mb-2">{product.itemsLeft} items left</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-orange-500 h-1.5 sm:h-2 rounded-full transition-all"
                      style={{ width: `${product.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Purple Bar */}
        <div className="w-full h-8 bg-gradient-to-r from-purple-600 to-purple-500 rounded"></div>
      </div>
    </div>
  );
}
