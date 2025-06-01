'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { Product } from '@/types';
import { useEffect, useState } from 'react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, image, discount, stock } = product;
  const addToCart = useCartStore((state) => state.addToCart);

  const [reviewCount, setReviewCount] = useState<number>(0);

  const validDiscount = discount ?? 0;
  const discountedPrice =
    validDiscount > 0 ? price * (1 - validDiscount / 100) : price;

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price: discountedPrice,
      quantity: 1,
      image,
    });
  };

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

  return (
    <div className="border-2 border-gray-100 rounded-xl p-3 hover:shadow-lg transition duration-200 w-full max-w-sm mx-auto">
      <Link href={`/product/${id}`}>
        <Image
          src={imageSrc}
          alt={name}
          width={300}
          height={300}
          className="w-full h-auto rounded-lg object-cover cursor-pointer"
        />
      </Link>

      <h2 className="text-base md:text-lg font-semibold mt-3 line-clamp-2">
        <Link href={`/product/${id}`} className="hover:underline text-primary">
          {name}
        </Link>
      </h2>

      {validDiscount > 0 ? (
        <div className="mt-1">
          <p className="text-red-600 font-semibold text-sm">-{validDiscount}% OFF</p>
          <p className="text-gray-500 line-through text-sm">
            ₦{(price / 100).toLocaleString()}
          </p>
          <p className="text-primary font-bold text-base">
            ₦{(discountedPrice / 100).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="text-primary font-bold text-base mt-1">
          ₦{(price / 100).toLocaleString()}
        </p>
      )}

      {stock === 0 ? (
        <p className="text-red-500 font-semibold mt-1 text-sm">Out of Stock</p>
      ) : (
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-yellow-500 text-xs">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 fill-current"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
              </svg>
            ))}
            <span className="text-gray-600 ml-1">
              ({reviewCount} verified ratings)
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={stock === 0}
      >
        {stock === 0 ? 'Unavailable' : 'Add to Cart'}
      </button>
    </div>
  );
}
