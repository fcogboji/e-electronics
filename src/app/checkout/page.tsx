'use client';

import { useCartStore } from '@/stores/cartStore';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { toast } from 'react-hot-toast'; // ✅ import toast

export default function CheckoutPage() {
  const cartItems = useCartStore((state) => state.items);
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) {
    return (
      <p className="p-4 text-center text-red-600">
        Please sign in to continue
      </p>
    );
  }

  const grandTotal: number = cartItems.reduce(
    (total: number, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const validCartItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems: validCartItems }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create Stripe session'); // ✅ error toast
        return;
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        toast.error('No Stripe session URL returned.'); // ✅ error toast
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Something went wrong during checkout.'); // ✅ error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border p-4 rounded"
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

                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p>₦{(item.price / 100).toLocaleString()}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-right text-xl font-bold">
            Total: ₦{(grandTotal / 100).toLocaleString()}
          </p>

          <div className="text-right mt-6">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Proceed with Order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
