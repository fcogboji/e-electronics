'use client';

export const dynamic = 'force-dynamic';

import { useCartStore } from '@/stores/cartStore';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import PaystackCheckout from '@/components/PaystackCheckout';
import PaymentMethodsIcons from '@/components/PaymentMethodsIcons';
import { motion } from 'framer-motion';

interface ProductSpecifications {
  [itemId: string]: {
    condition?: string;
    storage?: string;
    simType?: string;
    color?: string;
  };
}

export default function CheckoutPage() {
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user, isSignedIn } = useUser();
  const [showPayment, setShowPayment] = useState(false);
  const [specifications, setSpecifications] = useState<ProductSpecifications>({});

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-red-600 text-lg font-semibold">
            Please sign in to continue with checkout
          </p>
        </div>
      </div>
    );
  }

  const grandTotal: number = cartItems.reduce(
    (total: number, item) => total + item.price * item.quantity,
    0
  );

  const handlePaymentSuccess = (reference: string) => {
    console.log('Payment successful:', reference);
    toast.success('Payment successful! Order confirmed.');
    clearCart();
    setShowPayment(false);
    // Optionally redirect to order confirmation page
    // router.push(`/order-confirmation?ref=${reference}`);
  };

  const formatPrice = (price: number) => {
    return `₦${(price / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const handleSpecChange = (itemId: string, field: string, value: string) => {
    setSpecifications(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-600 text-lg">Your cart is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border border-gray-200 rounded-xl"
                      >
                        <div className="flex items-center gap-4 mb-4">
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
                            width={80}
                            height={80}
                            className="rounded-lg object-contain bg-gray-50 p-2"
                          />

                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-gray-600">{formatPrice(item.price)}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>

                        {/* Product Specifications */}
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Condition
                            </label>
                            <select
                              value={specifications[item.id]?.condition || ''}
                              onChange={(e) => handleSpecChange(item.id, 'condition', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select condition</option>
                              <option value="New">New</option>
                              <option value="Used">Used</option>
                              <option value="Refurbished">Refurbished</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Storage
                            </label>
                            <select
                              value={specifications[item.id]?.storage || ''}
                              onChange={(e) => handleSpecChange(item.id, 'storage', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select storage</option>
                              <option value="64GB">64GB</option>
                              <option value="128GB">128GB</option>
                              <option value="256GB">256GB</option>
                              <option value="512GB">512GB</option>
                              <option value="1TB">1TB</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SIM Type
                            </label>
                            <select
                              value={specifications[item.id]?.simType || ''}
                              onChange={(e) => handleSpecChange(item.id, 'simType', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select SIM type</option>
                              <option value="Single SIM">Single SIM</option>
                              <option value="Dual SIM">Dual SIM</option>
                              <option value="eSIM">eSIM</option>
                              <option value="Dual SIM + eSIM">Dual SIM + eSIM</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Color
                            </label>
                            <select
                              value={specifications[item.id]?.color || ''}
                              onChange={(e) => handleSpecChange(item.id, 'color', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Select color</option>
                              <option value="Black">Black</option>
                              <option value="White">White</option>
                              <option value="Blue">Blue</option>
                              <option value="Red">Red</option>
                              <option value="Green">Green</option>
                              <option value="Silver">Silver</option>
                              <option value="Gold">Gold</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                  <h2 className="text-xl font-semibold mb-6">Payment Details</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{formatPrice(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-xl">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <PaymentMethodsIcons size="sm" showText={true} className="justify-center" />
                  </div>

                  {!showPayment ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPayment(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors shadow-lg"
                    >
                      Proceed to Payment
                    </motion.button>
                  ) : (
                    <PaystackCheckout
                      amount={grandTotal}
                      email={user?.emailAddresses?.[0]?.emailAddress || 'customer@example.com'}
                      onSuccess={handlePaymentSuccess}
                      onClose={() => setShowPayment(false)}
                      metadata={{
                        cartItems: JSON.stringify(cartItems),
                        specifications: JSON.stringify(specifications),
                        customerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                        userId: user?.id,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
