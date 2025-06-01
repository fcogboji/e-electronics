'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { Product } from '@/types';

export default function ProductDetails({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const [reviewCount, setReviewCount] = useState<number>(0);

  const validDiscount = product.discount ?? 0;

  const discountedPrice =
    validDiscount > 0 ? product.price * (1 - validDiscount / 100) : product.price;

  const imageSrc =
    product.image?.startsWith('http') || product.image?.startsWith('/')
      ? product.image
      : `/images/${product.image || 'placeholder.png'}`;

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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md mt-6 sm:mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <Image
          src={imageSrc}
          alt={product.name}
          width={500}
          height={500}
          className="rounded-xl object-contain w-full h-auto"
        />

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

          <p className="text-gray-700 mt-2 text-sm sm:text-base">{product.description}</p>

          <div className="mt-4 space-y-3">
            {validDiscount > 0 && (
              <div className="inline-block bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">
                {validDiscount}% OFF
              </div>
            )}

            <div className="flex items-center space-x-4">
              {validDiscount > 0 && (
                <p className="line-through text-gray-500 text-lg">
                  ₦{(product.price / 100).toLocaleString()}
                </p>
              )}
              <p className="text-primary text-2xl font-bold">
                ₦{(discountedPrice / 100).toLocaleString()}
              </p>
            </div>

            <div>
              {product.stock > 0 ? (
                <p className="text-green-600 font-semibold">In Stock</p>
              ) : (
                <p className="text-red-500 font-semibold">Out of Stock</p>
              )}
            </div>

            <Link
              href={`/reviews-rating/${product.id}`}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <span className="text-yellow-500 text-lg">★★★★★</span>
              <span>
                {reviewCount > 0
                  ? `(${reviewCount.toLocaleString()} verified rating${reviewCount !== 1 ? 's' : ''})`
                  : '(No reviews yet)'}
              </span>
            </Link>
          </div>

          {product.stock > 0 && (
            <div className="mt-6">
              <button
                onClick={() => addToCart({ ...product, quantity: 1 })}
                className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 rounded-xl shadow-md hover:shadow-lg active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.293 2.707A1 1 0 007 17h10a1 1 0 00.894-1.447L17 13M7 13V6m0 0L5.4 5"
                  />
                </svg>
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
