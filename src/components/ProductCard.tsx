'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Heart, Eye } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useWishlist } from '@/hooks/useWishlist';
import { useWishlistStore } from '@/stores/wishlistStore';

type ProductCardProps = {
  product: Product;
  showRating?: boolean;
};

export default function ProductCard({ product, showRating = false }: ProductCardProps) {
  const { id, name, price, image, discount, stock } = product;

  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { isInWishlist, getWishlistItemId } = useWishlist();
  const { addItem, removeItem } = useWishlistStore();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '-50px 0px',
  });

  // Prevent hydration mismatch by only checking wishlist after mount
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Get wishlist state from the store (only after mount to prevent hydration issues)
  const isLiked = hasMounted ? isInWishlist(id) : false;
  const wishlistId = hasMounted ? getWishlistItemId(id) : null;

  const validDiscount = discount ?? 0;
  const discountedPrice =
    validDiscount > 0 ? price * (1 - validDiscount / 100) : price;


  const imageSrc =
    image.startsWith('http') || image.startsWith('/images') ? image : `/images/${image}`;

  useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const res = await fetch(`/api/reviews/count/${id}`);
        const data = await res.json();
        setReviewCount(data.count);
      } catch (err) {
        console.error('Failed to fetch review count', err);
      }
    };

    fetchReviewCount();
  }, [id]);

  const formatPrice = (price: number) => {
    return `₦${(price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your wishlist');
      router.push('/sign-in');
      return;
    }

    // Prevent concurrent requests
    if (isTogglingWishlist) {
      return;
    }

    setIsTogglingWishlist(true);

    try {
      if (isLiked && wishlistId) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist/${wishlistId}`, {
          method: 'DELETE',
        });

        if (res.ok || res.status === 404) {
          // Update store immediately for optimistic UI
          removeItem(wishlistId);
          toast.success('Removed from wishlist');
        } else {
          const error = await res.json();
          toast.error(error.error?.message || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        });

        if (res.ok) {
          const response = await res.json();
          const newItem = response.data || response;
          // Update store immediately for optimistic UI
          addItem({
            id: newItem.id,
            productId: id,
            createdAt: newItem.createdAt || new Date().toISOString(),
          });
          toast.success('Added to wishlist');
        } else if (res.status === 409) {
          // Item already in wishlist
          toast.success('Item is already in your wishlist');
        } else {
          const error = await res.json();
          toast.error(error.error?.message || 'Failed to add to wishlist');
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      toast.error('Something went wrong');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.8 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: Math.random() * 0.2 // Stagger animation for multiple cards
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      className="group relative bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-lg transition-all duration-300 w-full overflow-hidden"
    >
      {/* Discount Badge */}
      {validDiscount > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={inView ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -180, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 200 }}
          className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-lg"
        >
          -{validDiscount}%
        </motion.div>
      )}

      {/* Wishlist Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWishlistToggle}
        disabled={isTogglingWishlist}
        className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 z-10 p-1 sm:p-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Heart
          className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-300 ${
            isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 drop-shadow-lg'
          }`}
        />
      </motion.button>

      {/* Product Image */}
      <Link href={`/product/${id}`}>
        <div className="relative overflow-hidden rounded-lg mb-2 sm:mb-3 bg-white border border-gray-100 cursor-pointer aspect-square">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : { scale: 1.1, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="w-full h-full"
          >
            <Image
              src={imageSrc}
              alt={name}
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          </motion.div>
        </div>
      </Link>

      {/* Product Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-1 sm:space-y-2"
      >
        <Link href={`/product/${id}`}>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-300 line-clamp-2 text-[11px] sm:text-sm leading-tight"
          >
            {name}
          </motion.h3>
        </Link>

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative w-3 h-3">
                  {i < 4 ? (
                    // Full star
                    <svg
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                    </svg>
                  ) : i === 4 ? (
                    // Half star
                    <>
                      <svg
                        className="w-3 h-3 fill-gray-300 text-gray-300 absolute"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                      </svg>
                      <svg
                        className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute"
                        viewBox="0 0 20 20"
                        style={{ clipPath: 'inset(0 50% 0 0)' }}
                      >
                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                      </svg>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          {validDiscount > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <span className="text-xs sm:text-base md:text-lg font-bold text-red-600">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 line-through">
                {formatPrice(price)}
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-base md:text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {stock === 0 && (
          <p className="text-red-500 font-medium text-sm">Out of Stock</p>
        )}
      </motion.div>

    </motion.div>
  );
}
