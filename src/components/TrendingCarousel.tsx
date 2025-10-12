"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface TrendingCarouselProps {
  products: Product[];
}

const TrendingCarousel = ({ products }: TrendingCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Record<string, { isLiked: boolean; wishlistId: string | null }>>({});

  // Triple the products for smooth infinite scroll
  const tripleProducts = [...products, ...products, ...products];

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

  const formatPrice = (price: number) => {
    return `₦${(price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

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
    <div className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Trending Now
            </h2>
          </div>
          <p className="text-lg text-gray-600">What Everyone&apos;s Buying</p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4" />
        </motion.div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${offset})` }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {tripleProducts.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="flex-shrink-0 px-2"
                style={{ width: cardWidth }}
              >
                <Link href={`/product/${product.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-white border border-purple-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-purple-400 h-[350px]"
                  >
                    {/* Trending Badge */}
                    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>TREND</span>
                    </div>

                    {/* Discount Badge */}
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-10 left-0 z-10 bg-yellow-500 text-white px-2 py-1 text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleWishlistToggle(product.id, e)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 rounded-full shadow-sm"
                    >
                      <Heart className={`w-4 h-4 transition-colors duration-300 ${
                        wishlistItems[product.id]?.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-purple-500'
                      }`} />
                    </motion.button>

                    {/* Product Image */}
                    <div className="relative w-full pt-12 px-4 py-4">
                      <Image
                        src={
                          product.image.startsWith("http") ||
                          product.image.startsWith("/images")
                            ? product.image
                            : `/images/${product.image}`
                        }
                        alt={product.name}
                        width={180}
                        height={180}
                        className="w-full h-44 object-contain"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-3 space-y-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="text-center">
                        {product.discount && product.discount > 0 ? (
                          <div className="space-y-1">
                            <div className="text-base font-bold text-purple-600">
                              {formatPrice(
                                product.price *
                                  (1 - product.discount / 100)
                              )}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-base font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;
