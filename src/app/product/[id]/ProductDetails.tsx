'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';

type ProductVariant = {
  id: string;
  productId: string;
  condition: string | null;
  storage: string | null;
  simType: string | null;
  color: string | null;
  processor: string | null;
  memory: string | null;
  stock: number;
  priceAdjustment: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  color: string | null;
  isPrimary: boolean;
  order: number;
  createdAt: Date;
};

type ProductWithVariants = Product & {
  variants?: ProductVariant[];
  images?: ProductImage[];
};
import { Star, Heart, ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw } from 'lucide-react';
import PaystackCheckout from '@/components/PaystackCheckout';
import PaymentMethodsIcons from '@/components/PaymentMethodsIcons';
import ProductReviews from '@/components/ProductReviews';
import toast from 'react-hot-toast';
import { useWishlist } from '@/hooks/useWishlist';
import { useWishlistStore } from '@/stores/wishlistStore';

export default function ProductDetails({ product }: { product: ProductWithVariants }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { user, isLoaded } = useUser();
  const { isInWishlist, getWishlistItemId } = useWishlist();
  const { addItem, removeItem } = useWishlistStore();

  // Define all possible options (standard options that should always be displayed)
  const ALL_CONDITIONS = ['Fair', 'Good', 'Excellent', 'Premium'];
  const ALL_BATTERIES = ['Standard battery', 'New battery'];
  const ALL_STORAGES = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB'];
  const ALL_SIM_TYPES = ['eSIM', 'Physical SIM + eSIM'];
  const ALL_COLORS = ['Black', 'White', 'Grey', 'Silver', 'Space Gray', 'Space Black', 'Blue', 'Red', 'Green', 'Purple', 'Pink', 'Yellow', 'Gold', 'Rose Gold'];
  const ALL_MEMORIES = ['8 GB', '16 GB', '32 GB', '64 GB', '128 GB'];

  // Color mapping for visual representation
  const getColorClass = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      'Black': 'bg-slate-900',
      'White': 'bg-gray-100',
      'Grey': 'bg-gray-400',
      'Silver': 'bg-gray-300',
      'Space Gray': 'bg-gray-600',
      'Space Black': 'bg-black',
      'Blue': 'bg-blue-400',
      'Red': 'bg-red-600',
      'Green': 'bg-green-500',
      'Purple': 'bg-purple-300',
      'Pink': 'bg-pink-300',
      'Yellow': 'bg-yellow-400',
      'Gold': 'bg-yellow-500',
      'Rose Gold': 'bg-rose-300',
    };
    return colorMap[color] || 'bg-gray-400';
  };

  const needsColorBorder = (color: string): boolean => {
    return ['White', 'Silver', 'Rose Gold', 'Pink', 'Yellow'].includes(color);
  };

  // Get unique options from variants (to know which exist)
  const getAvailableOptions = () => {
    const variants = product.variants || [];
    const availableConditions = [...new Set(variants.map(v => v.condition).filter((v): v is string => v !== null))];
    const availableStorages = [...new Set(variants.map(v => v.storage).filter((v): v is string => v !== null))];
    const availableSimTypes = [...new Set(variants.map(v => v.simType).filter((v): v is string => v !== null))];
    const availableColors = [...new Set(variants.map(v => v.color).filter((v): v is string => v !== null))];
    const availableMemories = [...new Set(variants.map(v => v.memory).filter((v): v is string => v !== null))];

    return { availableConditions, availableStorages, availableSimTypes, availableColors, availableMemories };
  };

  const { availableConditions, availableStorages, availableSimTypes, availableColors, availableMemories } = getAvailableOptions();

  // Determine which options to display (show all if any exist, otherwise show standard set)
  const conditions = availableConditions.length > 0 ? ALL_CONDITIONS : [];
  const batteries = ALL_BATTERIES; // Always show battery options
  const storages = availableStorages.length > 0 ? ALL_STORAGES : [];
  const simTypes = availableSimTypes.length > 0 ? ALL_SIM_TYPES : [];
  const colors = availableColors.length > 0 ? ALL_COLORS : [];
  const memories = availableMemories.length > 0 ? ALL_MEMORIES : [];

  const [reviewCount, setReviewCount] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Get wishlist state from the store
  const isLiked = isInWishlist(product.id);
  const wishlistId = getWishlistItemId(product.id);

  // New customization states - initialize with first available option or default
  const [selectedCondition, setSelectedCondition] = useState<string>(
    availableConditions[0] || conditions[0] || 'Fair'
  );
  const [selectedBattery, setSelectedBattery] = useState<string>('Standard battery');
  const [selectedStorage, setSelectedStorage] = useState<string>(
    availableStorages[0] || storages[0] || '128 GB'
  );
  const [selectedSimType, setSelectedSimType] = useState<string>(
    availableSimTypes[0] || simTypes[0] || 'eSIM'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors[0] || colors[0] || 'Black'
  );
  const [selectedMemory, setSelectedMemory] = useState<string>(
    availableMemories[0] || memories[0] || ''
  );

  const validDiscount = product.discount ?? 0;

  const basePrice = validDiscount > 0 ? product.price * (1 - validDiscount / 100) : product.price;

  // Find the current variant based on selections
  const getCurrentVariant = () => {
    return product.variants?.find(v =>
      v.condition === selectedCondition &&
      v.storage === selectedStorage &&
      (simTypes.length === 0 || v.simType === selectedSimType) &&
      v.color === selectedColor &&
      (memories.length === 0 || v.memory === selectedMemory)
    );
  };

  const currentVariant = getCurrentVariant();
  const discountedPrice = currentVariant ? basePrice + currentVariant.priceAdjustment : basePrice;
  const variantStock = currentVariant?.stock || 0;
  const isVariantAvailable = currentVariant?.isAvailable && variantStock > 0;

  // Check if a specific option exists in the database and is available
  const isConditionAvailable = (condition: string) => {
    return product.variants?.some(v =>
      v.condition === condition &&
      v.isAvailable &&
      v.stock > 0
    );
  };

  const isStorageAvailable = (storage: string) => {
    return product.variants?.some(v =>
      v.storage === storage &&
      v.isAvailable &&
      v.stock > 0
    );
  };

  const isSimTypeAvailable = (simType: string) => {
    return product.variants?.some(v =>
      v.simType === simType &&
      v.isAvailable &&
      v.stock > 0
    );
  };

  const isColorAvailable = (color: string) => {
    return product.variants?.some(v =>
      v.color === color &&
      v.isAvailable &&
      v.stock > 0
    );
  };

  const isMemoryAvailable = (memory: string) => {
    return product.variants?.some(v =>
      v.memory === memory &&
      v.isAvailable &&
      v.stock > 0
    );
  };

  // Get price for a specific option
  const getConditionPrice = (condition: string) => {
    const variant = product.variants?.find(v =>
      v.condition === condition &&
      v.storage === selectedStorage &&
      (simTypes.length === 0 || v.simType === selectedSimType) &&
      v.color === selectedColor &&
      (memories.length === 0 || v.memory === selectedMemory)
    );
    return variant ? basePrice + variant.priceAdjustment : basePrice;
  };

  const getStoragePrice = (storage: string) => {
    const variant = product.variants?.find(v =>
      v.condition === selectedCondition &&
      v.storage === storage &&
      (simTypes.length === 0 || v.simType === selectedSimType) &&
      v.color === selectedColor &&
      (memories.length === 0 || v.memory === selectedMemory)
    );
    return variant ? basePrice + variant.priceAdjustment : basePrice;
  };

  const getColorPrice = (color: string) => {
    const variant = product.variants?.find(v =>
      v.condition === selectedCondition &&
      v.storage === selectedStorage &&
      (simTypes.length === 0 || v.simType === selectedSimType) &&
      v.color === color &&
      (memories.length === 0 || v.memory === selectedMemory)
    );
    return variant ? basePrice + variant.priceAdjustment : basePrice;
  };

  const getMemoryPrice = (memory: string) => {
    // Calculate price based on 39% increase per tier
    const memoryTiers = ['8 GB', '16 GB', '32 GB', '64 GB', '128 GB'];
    const baseMemory = memoryTiers[0]; // 8 GB is the base
    const baseMemoryIndex = memoryTiers.indexOf(baseMemory);
    const selectedMemoryIndex = memoryTiers.indexOf(memory);

    if (selectedMemoryIndex === -1 || baseMemoryIndex === -1) {
      return basePrice;
    }

    // Calculate cumulative increase (39% per tier)
    const tierDifference = selectedMemoryIndex - baseMemoryIndex;
    const multiplier = Math.pow(1.39, tierDifference);

    return basePrice * multiplier;
  };

  const imageSrc =
    product.image?.startsWith('http') || product.image?.startsWith('/')
      ? product.image
      : `/images/${product.image || 'placeholder.png'}`;

  // Get images for the selected color
  const getColorImages = (color: string): string[] => {
    if (product.images && product.images.length > 0) {
      const colorImages = product.images
        .filter(img => img.color === color)
        .map(img => img.imageUrl);

      if (colorImages.length > 0) {
        return colorImages;
      }
    }

    // Fallback to default image
    return [imageSrc];
  };

  // Current displayed images based on selected color
  const [productImages, setProductImages] = useState<string[]>(getColorImages(selectedColor));

  useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const res = await fetch(`/api/reviews/count/${product.id}`);
        const data = await res.json();
        setReviewCount(data.count);
      } catch (err) {
        console.error('Error fetching review count', err);
      }
    };

    fetchReviewCount();
  }, [product.id]);

  // Update images when color changes
  useEffect(() => {
    const newImages = getColorImages(selectedColor);
    setProductImages(newImages);
    setSelectedImage(0); // Reset to first image when color changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  const formatPrice = (price: number) => {
    return `₦${(price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const handleAddToCart = () => {
    if (!isVariantAvailable) {
      toast.error('This variant is out of stock');
      return;
    }

    let variantName = `${product.name} (`;
    const parts: string[] = [];

    if (selectedCondition) parts.push(selectedCondition);
    if (selectedBattery) parts.push(selectedBattery);
    if (selectedStorage) parts.push(selectedStorage);
    if (selectedColor) parts.push(selectedColor);
    if (product.isLaptop && selectedMemory) parts.push(selectedMemory);

    variantName += parts.join(', ') + ')';

    addToCart({
      id: product.id,
      name: variantName,
      price: discountedPrice,
      quantity,
      image: productImages[selectedImage] || imageSrc,
    });
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    setShowPayment(true);
  };

  const updateQuantity = (change: number) => {
    const newQuantity = quantity + change;
    const maxStock = isVariantAvailable ? variantStock : product.stock;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your wishlist');
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
          body: JSON.stringify({ productId: product.id }),
        });

        if (res.ok) {
          const response = await res.json();
          const newItem = response.data || response;
          // Update store immediately for optimistic UI
          addItem({
            id: newItem.id,
            productId: product.id,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12">
            {/* Product Images */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-96 overflow-hidden rounded-2xl bg-gray-100"
              >
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />

                {validDiscount > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                  >
                    -{validDiscount}%
                  </motion.div>
                )}
              </motion.div>

              {/* Image Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index
                          ? 'border-blue-500 scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  {product.name}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => {
                      if (i < 4) {
                        return <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />;
                      } else if (i === 4) {
                        return (
                          <div key={i} className="relative w-5 h-5">
                            <Star className="w-5 h-5 text-yellow-400 absolute" />
                            <div className="absolute inset-0 overflow-hidden w-1/2">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Link
                    href={`/reviews-rating/${product.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ({reviewCount} reviews)
                  </Link>
                </motion.div>

                {/* Description is rendered in dedicated section below */}
              </div>

              {/* Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(discountedPrice)}
                  </span>
                  {validDiscount > 0 && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                {validDiscount > 0 && (
                  <p className="text-green-600 font-semibold">
                    You save {formatPrice(product.price - discountedPrice)}
                  </p>
                )}
              </motion.div>

              {/* Stock Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {isVariantAvailable ? (
                  <p className="text-green-600 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {variantStock} in stock
                  </p>
                ) : (
                  <p className="text-red-500 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Out of Stock
                  </p>
                )}
              </motion.div>

              {product.stock > 0 && (
                <>
                  {/* Condition Selector */}
                  {conditions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <h1 className="text-5xl font-serif text-gray-900">
                        Select the condition
                      </h1>
                      <div className="grid grid-cols-2 gap-4">
                        {conditions.map((condition) => {
                          const available = isConditionAvailable(condition);
                          return (
                            <button
                              key={condition}
                              onClick={() => available && setSelectedCondition(condition)}
                              disabled={!available}
                              style={{ borderRadius: '6px' }}
                              className={`relative bg-white border-2 p-2 text-left transition-all hover:border-gray-400 ${
                                selectedCondition === condition ? 'border-blue-500' : 'border-gray-300'
                              } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="text-base font-medium text-gray-900">
                                    {condition}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    {formatPrice(getConditionPrice(condition))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Battery Selector */}
                  {conditions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <h1 className="text-5xl font-serif text-gray-900">
                        Select a battery option
                      </h1>
                      <p className="text-sm text-gray-600">
                        All devices guaranteed solid battery health. <a href="#" className="text-blue-600 hover:underline">Learn about your options</a>
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {batteries.map((battery) => {
                          const isNewBattery = battery === 'New battery';
                          const isSoldOut = isNewBattery; // New battery is sold out by default
                          return (
                            <button
                              key={battery}
                              onClick={() => !isSoldOut && setSelectedBattery(battery)}
                              disabled={isSoldOut}
                              style={{ borderRadius: '6px' }}
                              className={`relative bg-white border-2 p-3 text-left transition-all hover:border-gray-400 ${
                                selectedBattery === battery ? 'border-blue-500' : 'border-gray-300'
                              } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-base font-medium text-gray-900">
                                    {battery}
                                  </div>
                                  {!isSoldOut && (
                                    <div className="text-base font-semibold text-gray-900">
                                      {formatPrice(discountedPrice)}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {isNewBattery ? (
                                    <span className="text-red-600 font-medium">Sold out</span>
                                  ) : (
                                    'Good for average daily use'
                                  )}
                                </div>
                                {isNewBattery && !isSoldOut && (
                                  <div className="text-xs text-gray-500">
                                    Best for heavy daily use.
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Color Selector */}
                  {colors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <h1 className="text-5xl font-serif text-gray-900">
                        Select the colour
                      </h1>
                      <div className="grid grid-cols-2 gap-4">
                        {colors.map((color) => {
                          const available = isColorAvailable(color);
                          const colorClass = getColorClass(color);
                          return (
                            <button
                              key={color}
                              onClick={() => available && setSelectedColor(color)}
                              disabled={!available}
                              style={{ borderRadius: '6px' }}
                              className={`relative bg-white border-2 p-2 text-left transition-all hover:border-gray-400 ${
                                selectedColor === color ? 'border-blue-500' : 'border-gray-300'
                              } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="relative w-7 h-7">
                                  <div
                                    className={`w-full h-full rounded-full ${colorClass} ${
                                      needsColorBorder(color) ? 'border-2 border-gray-300' : ''
                                    }`}
                                  ></div>
                                  {selectedColor === color && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-white rounded-full border border-gray-800"></div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-base font-medium text-gray-900">
                                    {color}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    {formatPrice(getColorPrice(color))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Storage Selector */}
                  {storages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <h1 className="text-5xl font-serif text-gray-900">
                        Select storage
                      </h1>
                      <div className="grid grid-cols-2 gap-4">
                        {storages.map((storage) => {
                          const available = isStorageAvailable(storage);
                          return (
                            <button
                              key={storage}
                              onClick={() => available && setSelectedStorage(storage)}
                              disabled={!available}
                              style={{ borderRadius: '6px' }}
                              className={`relative bg-white border-2 p-2 text-left transition-all hover:border-gray-400 ${
                                selectedStorage === storage ? 'border-blue-500' : 'border-gray-300'
                              } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="text-base font-medium text-gray-900">
                                    {storage}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    {formatPrice(getStoragePrice(storage))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* SIM Type Selector */}
                  {simTypes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <h1 className="text-5xl font-serif text-gray-900">
                        Select SIM card type
                      </h1>
                      <div className="grid grid-cols-2 gap-4">
                        {simTypes.map((simType) => {
                          const available = isSimTypeAvailable(simType);
                          return (
                            <button
                              key={simType}
                              onClick={() => available && setSelectedSimType(simType)}
                              disabled={!available}
                              style={{ borderRadius: '6px' }}
                              className={`relative bg-white border-2 p-2 text-left transition-all hover:border-gray-400 ${
                                selectedSimType === simType ? 'border-blue-500' : 'border-gray-300'
                              } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="text-base font-medium text-gray-900">
                                    {simType}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    {simType === 'eSIM' ? '2 virtual SIM slots' : '1 physical + 1 virtual'}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Memory Selector - Only for Laptops */}
                  {product.isLaptop && memories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <h1 className="text-5xl font-serif text-gray-900">
                        Select memory
                      </h1>
                      <div className="grid grid-cols-1 gap-3">
                        {memories.map((memory) => {
                          const available = isMemoryAvailable(memory);
                          return (
                            <button
                              key={memory}
                              onClick={() => available && setSelectedMemory(memory)}
                              disabled={!available}
                              style={{ borderRadius: '6px' }}
                              className={`relative bg-white border-2 p-3 text-left transition-all hover:border-gray-400 ${
                                selectedMemory === memory ? 'border-blue-500' : 'border-gray-300'
                              } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-base font-medium text-gray-900">
                                    {memory}
                                  </div>
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                  {formatPrice(getMemoryPrice(memory))}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Quantity Selector */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, duration: 0.6 }}
                    className="flex items-center gap-4"
                  >
                    <span className="font-semibold">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(1)}
                        disabled={quantity >= (isVariantAvailable ? variantStock : product.stock)}
                        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      style={{ borderRadius: '6px' }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyNow}
                      style={{ borderRadius: '6px' }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      Buy Now
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleWishlistToggle}
                      disabled={isTogglingWishlist}
                      style={{ borderRadius: '6px' }}
                      className="p-3 border border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors duration-300 ${
                          isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </motion.button>
                  </motion.div>
                </>
              )}

              {/* Payment Methods */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="pt-6 border-t"
              >
                <PaymentMethodsIcons size="md" showText={true} />
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t"
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders over ₦50,000</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-500">SSL encrypted</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-sm">30-Day Returns</p>
                    <p className="text-xs text-gray-500">Money back guarantee</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Payment Modal */}
          {showPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold mb-4">Complete Your Purchase</h3>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{product.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedCondition && <div>Condition: <span className="font-medium">{selectedCondition}</span></div>}
                    {selectedBattery && <div>Battery: <span className="font-medium">{selectedBattery}</span></div>}
                    {selectedStorage && <div>Storage: <span className="font-medium">{selectedStorage}</span></div>}
                    {selectedSimType && simTypes.length > 0 && <div>SIM Type: <span className="font-medium">{selectedSimType}</span></div>}
                    {selectedColor && <div>Colour: <span className="font-medium">{selectedColor}</span></div>}
                    {product.isLaptop && selectedMemory && <div>Memory: <span className="font-medium">{selectedMemory}</span></div>}
                    <div>Quantity: <span className="font-medium">{quantity}</span></div>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">{formatPrice(discountedPrice * quantity)}</span>
                  </div>
                </div>

                <PaystackCheckout
                  amount={discountedPrice * quantity}
                  email="customer@example.com" // In real app, get from user auth
                  onSuccess={(reference) => {
                    setShowPayment(false);
                    toast.success('Payment successful! Order confirmed.');
                    console.log('Payment reference:', reference);
                  }}
                  onClose={() => setShowPayment(false)}
                  metadata={{
                    productId: product.id,
                    productName: product.name,
                    quantity,
                  }}
                />

                <button
                  onClick={() => setShowPayment(false)}
                  style={{ borderRadius: '6px' }}
                  className="w-full mt-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Product Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden p-6 lg:p-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>

          {/* Parse and format the description */}
          {(() => {
            const description = product.description || '';
            const sections: { title?: string; content: string }[] = [];

            // Split by common patterns in the description
            const parts = description.split(/(?=[A-Z][a-z]+\s+[a-z]+\s*$)|(?=KINDLY NOTE)/i);

            parts.forEach((part) => {
              const trimmed = part.trim();
              if (!trimmed) return;

              // Check if this is the "KINDLY NOTE" section
              if (trimmed.startsWith('KINDLY NOTE')) {
                sections.unshift({ title: 'Important Note', content: trimmed });
              }
              // Check if it's a section with a title (sentences that end with a period and are followed by more text)
              else if (trimmed.match(/^[A-Z].+?\.\s+.+/)) {
                const sentences = trimmed.split(/\.\s+(?=[A-Z])/);
                sentences.forEach((sentence, idx) => {
                  if (idx === 0 && sentence.length < 100) {
                    // First sentence is likely a title
                    const remaining = sentences.slice(1).join('. ') + (sentences.length > 1 ? '.' : '');
                    sections.push({ title: sentence, content: remaining || sentence + '.' });
                  } else if (idx === 0) {
                    // First sentence is content, not a title
                    sections.push({ content: trimmed });
                  }
                });
              } else {
                sections.push({ content: trimmed });
              }
            });

            // If no sections were parsed, just display the raw description
            if (sections.length === 0 && description) {
              // Try to split by common sentence patterns
              const lines = description.split(/(?<=[.!?])\s+(?=[A-Z])/);

              lines.forEach((line) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('KINDLY NOTE')) {
                  sections.unshift({ title: 'Important Note', content: trimmed });
                } else if (trimmed.toLowerCase().includes('break down barriers')) {
                  sections.push({ title: 'Language Translation', content: trimmed });
                } else if (trimmed.toLowerCase().includes('bring details out') || trimmed.toLowerCase().includes('nightography')) {
                  sections.push({ title: 'Photography', content: trimmed });
                } else if (trimmed.toLowerCase().includes('zoom')) {
                  sections.push({ title: 'High Resolution Zoom', content: trimmed });
                } else if (trimmed.toLowerCase().includes('generative edit')) {
                  sections.push({ title: 'Photo Editing', content: trimmed });
                } else if (trimmed.toLowerCase().includes('game and stream')) {
                  sections.push({ title: 'Display', content: trimmed });
                } else if (trimmed.toLowerCase().includes('titanium')) {
                  // This should be last - we'll handle it separately
                  sections.push({ title: 'Durability', content: trimmed });
                } else if (trimmed.length > 0) {
                  sections.push({ content: trimmed });
                }
              });
            }

            // Separate titanium section to ensure it's last
            const titaniumIndex = sections.findIndex(s =>
              s.title?.toLowerCase().includes('durability') ||
              s.content?.toLowerCase().includes('titanium')
            );

            let titaniumSection = null;
            if (titaniumIndex !== -1) {
              titaniumSection = sections.splice(titaniumIndex, 1)[0];
            }

            return (
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    {section.title && (
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    )}
                    <p className="text-gray-700 leading-relaxed">{section.content}</p>
                  </div>
                ))}

                {/* Titanium section always at the bottom */}
                {titaniumSection && (
                  <div className="space-y-2 pt-4 border-t">
                    {titaniumSection.title && (
                      <h3 className="text-lg font-semibold text-gray-900">{titaniumSection.title}</h3>
                    )}
                    <p className="text-gray-700 leading-relaxed">{titaniumSection.content}</p>
                  </div>
                )}

                {/* If no sections were parsed at all, show raw description */}
                {sections.length === 0 && !titaniumSection && description && (
                  <p className="text-gray-700 leading-relaxed">{description}</p>
                )}
              </div>
            );
          })()}
        </motion.div>

        {/* Product Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden p-6 lg:p-12"
        >
          <ProductReviews productId={product.id} />
        </motion.div>
      </div>
    </div>
  );
}
