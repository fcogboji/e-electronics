'use client';

import { useCartStore } from '@/stores/cartStore';

type Props = {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  discount?: number; // Optional discount percentage
};

export default function AddToCartButton({
  id,
  name,
  image,
  price,
  stock,
  discount,
}: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = () => {
    if (stock > 0) {
      const finalPrice = discount
        ? price * (1 - discount / 100)
        : price;

      addToCart({
        id,
        name,
        image,
        price: Math.round(finalPrice * 100), // Convert to Kobo if using Stripe NGN
        quantity: 1,
      });
    } else {
      alert('❌ This product is out of stock.');
    }
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-80"
    >
      Add to Cart
    </button>
  );
}
