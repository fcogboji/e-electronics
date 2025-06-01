'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

export default function CartPage() {
  const cartItems = useCartStore(state => state.items);

  const removeFromCart = useCartStore(state => state.removeFromCart);
  const increaseQty = useCartStore(state => state.increaseQty);
  const decreaseQty = useCartStore(state => state.decreaseQty);

  const grandTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cart Page</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 border p-4 rounded-md items-center"
            >
              <Image
                src={
                  item.image?.startsWith('http')
                    ? item.image
                    : item.image
                    ? `/images/${item.image}`
                    : '/placeholder.png'
                }
                alt={item.name || 'Product Image'}
                width={100}
                height={100}
                className="rounded"
              />

              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600">
                  ₦{(item.price / 100).toLocaleString()} x {item.quantity}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* ✅ Updated grand total formatting */}
          <div className="text-right mt-4 text-xl font-bold">
            Grand Total: ₦{(grandTotal / 100).toLocaleString()}
          </div>

          <div className="text-right mt-4">
            <Link
              href="/checkout"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
