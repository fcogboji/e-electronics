// src/app/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  useEffect(() => {
    clearCart(); // ✅ Empty cart when arriving on success page
  }, [clearCart]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-4">
      🎉 ✅ Payment Successful!
      </h1>
      <p className="mb-4">Thank you for your purchase. Your order has been processed.</p>
      <div className="animate-bounce text-3xl">🚀</div>
      <button
        onClick={() => router.push('/')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Continue Shopping
      </button>
    </div>
  );
}
