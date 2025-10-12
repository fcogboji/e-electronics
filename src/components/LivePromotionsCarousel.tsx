'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Heart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LivePromotionsCarouselProps {
  products: Product[];
  title?: string;
}

const LivePromotionsCarousel = ({ products, title = "Featured" }: LivePromotionsCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Record<string, { isLiked: boolean; wishlistId: string | null }>>({});

  // Triple the products for smooth infinite scroll
  const tripleProducts = [...products, ...products, ...products];

  const formatPrice = (price: number) => {
    return `₦${(price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Auto slide every 2 seconds
  useEffect(() => {
    if (isPaused || products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  // Reset to start seamlessly when reaching the end of first set
  useEffect(() => {
    if (currentIndex >= products.length) {
      const timer = setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = 'none';
          setCurrentIndex(0);
          setTimeout(() => {
            if (trackRef.current) {
              trackRef.current.style.transition = 'transform 0.5s ease-in-out';
            }
          }, 50);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, products.length]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user) return;

      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const response = await res.json();
          const wishlist = response.data || [];
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

  const handleWishlistToggle = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
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
          const data = await res.json();
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

  if (products.length === 0) return null;

  // Calculate transform offset (showing 3 cards at a time)
  const cardWidth = `calc(100% / 3)`;
  const offset = `calc(-${currentIndex} * ${cardWidth})`;

  return (
    <div className="py-6 bg-white">
      <div className="container mx-auto px-4">
        {/* Header with Tabs */}
        <div className="mb-4">
          <div className="flex items-center gap-4 border-b border-gray-200">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-t-md">
              Live Promotions
            </button>
            <button className="px-4 py-2 text-2xl font-medium text-gray-600 hover:text-gray-900">
            Exclusive Live Promotions – Shop & Save Now!
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${offset})` }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {tripleProducts.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 px-2"
                style={{ width: cardWidth }}
              >
                <Link href={`/product/${product.id}`}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col relative">
                    {/* Discount Badge */}
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-1 right-1 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                        -{product.discount}%
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleWishlistToggle(product.id, e)}
                      className="absolute top-1 left-1 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors duration-300 ${
                          wishlistItems[product.id]?.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Product Image */}
                    <div className="relative w-full h-[110px] flex items-center justify-center p-2 bg-gray-50">
                      <Image
                        src={product.image.startsWith('http') || product.image.startsWith('/images')
                          ? product.image
                          : `/images/${product.image}`}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="object-contain max-h-[100px]"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-2 flex-1 flex flex-col">
                      <h3 className="text-xs text-blue-600 line-clamp-2 mb-1 min-h-[32px] font-medium">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="mt-auto">
                        {product.discount && product.discount > 0 ? (
                          <div>
                            <div className="text-sm font-bold text-red-600">
                              {formatPrice(product.price * (1 - product.discount / 100))}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-bold text-red-600">
                            {formatPrice(product.price)}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePromotionsCarousel;