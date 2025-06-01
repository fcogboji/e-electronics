// Inside a component (e.g. CheckoutButton.tsx)
"use client";

import { useRouter } from 'next/navigation';

export default function CheckoutButton({ cart }: { cart: any[] }) {
  const router = useRouter();

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST", // ✅ Must be POST
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cart), // send cart as body
    });

    if (res.ok) {
      const data = await res.json();
      router.push(data.url); // redirect to Stripe Checkout
    } else {
      console.error("Failed to create checkout session");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-black text-white px-4 py-2 rounded"
    >
      Checkout
    </button>
  );
}
