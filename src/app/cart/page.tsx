'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import PaymentMethodsIcons from '@/components/PaymentMethodsIcons';
import { Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const cartItems = useCartStore(state => state.items);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const increaseQty = useCartStore(state => state.increaseQty);
  const decreaseQty = useCartStore(state => state.decreaseQty);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const grandTotal = subtotal - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal: subtotal,
        }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        toast.success(`Coupon applied! You save ₦${(data.coupon.discountAmount / 100).toFixed(2)}`);
      } else {
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

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
                    ? item.image.startsWith('/images/')
                      ? item.image
                      : `/images/${item.image}`
                    : '/images/placeholder.svg'
                }
                alt={item.name || 'Product Image'}
                width={100}
                height={100}
                className="rounded"
              />

              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600">
                  ₦{(item.price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} x {item.quantity}
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

          {/* Coupon Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Have a coupon code?
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                  <span className="text-sm text-green-600">
                    (-₦{(appliedCoupon.discountAmount / 100).toFixed(2)})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={validatingCoupon}
                />
                <button
                  onClick={applyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₦{(subtotal / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-₦{(discountAmount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
              )}
              <div className="pt-2 border-t flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>₦{(grandTotal / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <PaymentMethodsIcons size="md" showText={true} />
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
