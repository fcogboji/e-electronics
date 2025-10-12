'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

interface PaystackCheckoutProps {
  amount: number; // in kobo (₦1 = 100 kobo)
  email: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  metadata?: Record<string, any>;
  disabled?: boolean;
  buttonText?: string;
  className?: string;
}

const PaystackCheckout = ({
  amount,
  email,
  onSuccess,
  onClose,
  metadata,
  disabled = false,
  buttonText = "Pay Now",
  className = "",
}: PaystackCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string;

  if (!publicKey) {
    console.error('Paystack public key not found');
    return (
      <button
        disabled
        className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed"
      >
        Payment Unavailable
      </button>
    );
  }

  const handleSuccess = async (reference: any) => {
    setIsLoading(true);

    try {
      // Verify payment on the server
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: reference.reference }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        toast.success('Payment successful! Redirecting to home...');
        onSuccess?.(reference.reference);

        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    toast.error('Payment cancelled');
    onClose?.();
  };

  const componentProps = {
    email,
    amount,
    currency: 'NGN',
    publicKey,
    text: buttonText,
    onSuccess: handleSuccess,
    onClose: handleClose,
    metadata: {
      custom_fields: [
        {
          display_name: "Email",
          variable_name: "email",
          value: email,
        },
      ],
      ...metadata,
    },
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Total Amount:</span>
          <span className="text-lg font-bold text-gray-900">
            {formatAmount(amount)}
          </span>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Secure payment with Visa, Mastercard, Verve</span>
        </div>
      </div>

      {/* Payment Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span>Bank Level Security</span>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span>Instant Processing</span>
        </div>
      </div>

      {/* Payment Button */}
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <PaystackButton
          {...componentProps}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white
            flex items-center justify-center gap-3 transition-all duration-300
            ${disabled || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
            }
          `}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              {buttonText} • {formatAmount(amount)}
            </>
          )}
        </PaystackButton>
      </motion.div>

      {/* Trust Indicators */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>Powered by</span>
          <span className="font-semibold text-green-600">Paystack</span>
        </div>
      </div>
    </div>
  );
};

export default PaystackCheckout;