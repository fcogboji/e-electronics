import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentMethodsIconsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const PaymentMethodsIcons: React.FC<PaymentMethodsIconsProps> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showText && (
        <span className="text-sm text-gray-600 font-medium">We accept:</span>
      )}
      <div className="flex items-center gap-2">
        {/* Visa */}
        <div className={`${sizeClasses[size]} flex items-center justify-center bg-white border border-gray-200 rounded px-2`}>
          <svg className="h-full w-auto" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="32" rx="4" fill="white"/>
            <path d="M18.5 11.5L16 20.5H13.5L11.5 13.2C11.4 12.8 11.2 12.5 10.8 12.3C10.1 12 9.2 11.7 8.5 11.5L8.6 11.5H13C13.6 11.5 14.1 11.9 14.2 12.5L15 17L17.5 11.5H20L18.5 11.5ZM29 17.3C29 15 25.5 14.8 25.5 13.8C25.5 13.5 25.8 13.2 26.4 13.1C27 13 28 13 29 13.5L29.5 11.8C28.9 11.6 28.2 11.4 27.3 11.4C25 11.4 23.3 12.6 23.3 14.4C23.3 15.7 24.5 16.4 25.4 16.8C26.3 17.2 26.6 17.5 26.6 17.8C26.6 18.3 26 18.5 25.5 18.5C24.5 18.5 23.5 18.2 22.9 17.9L22.4 19.6C23 19.9 24.1 20.1 25.2 20.1C27.7 20.2 29 19 29 17.3ZM37 20.5H39.2L37.3 11.5H35.3C34.8 11.5 34.4 11.8 34.2 12.2L30.5 20.5H33L33.6 18.9H36.5L37 20.5ZM34.3 17L35.5 14L36.1 17H34.3ZM23 11.5L21 20.5H18.8L20.8 11.5H23Z" fill="#1434CB"/>
          </svg>
        </div>

        {/* Mastercard */}
        <div className={`${sizeClasses[size]} flex items-center justify-center bg-white border border-gray-200 rounded px-2`}>
          <svg className="h-full w-auto" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="32" rx="4" fill="white"/>
            <circle cx="18" cy="16" r="7" fill="#EB001B"/>
            <circle cx="30" cy="16" r="7" fill="#F79E1B"/>
            <path d="M24 11.5C22.8 12.5 22 14.2 22 16C22 17.8 22.8 19.5 24 20.5C25.2 19.5 26 17.8 26 16C26 14.2 25.2 12.5 24 11.5Z" fill="#FF5F00"/>
          </svg>
        </div>

        {/* Verve */}
        <div className={`${sizeClasses[size]} flex items-center justify-center bg-white border border-gray-200 rounded px-2`}>
          <svg className="h-full w-auto" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="32" rx="4" fill="white"/>
            <path d="M12 12H14.5L16 20H13.5L12 12ZM18.5 12L17 20H19.5L21 12H18.5ZM23 12L24.5 20H27L25.5 12H23ZM29 12L30.5 20H33L31.5 12H29Z" fill="#00425F"/>
            <path d="M34 14C34 12.9 34.9 12 36 12C37.1 12 38 12.9 38 14C38 15.1 37.1 16 36 16C34.9 16 34 15.1 34 14Z" fill="#EE312A"/>
            <text x="10" y="26" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="#00425F">VERVE</text>
          </svg>
        </div>

        {/* Generic Card Icon for backup */}
        <div className={`${sizeClasses[size]} flex items-center justify-center text-gray-400`}>
          <CreditCard className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsIcons;
