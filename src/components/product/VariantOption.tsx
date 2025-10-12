'use client';

import { cn } from '@/lib/utils';

interface VariantOptionProps {
  label: string;
  price?: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
  layout?: 'grid' | 'list';
  colorSwatch?: string;
  soldOut?: boolean;
  radioSize?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function VariantOption({
  label,
  price,
  description,
  selected,
  onClick,
  icon,
  badge,
  disabled = false,
  layout = 'grid',
  colorSwatch,
  soldOut = false,
  radioSize = 'small',
}: VariantOptionProps) {
  const displayPrice = soldOut ? 'Sold out' : price;

  // Calculate radio button sizes
  const radioSizes = {
    small: { outer: 'w-2 h-2', inner: 'w-2 h-2' },
    medium: { outer: 'w-3 h-3', inner: 'w-3 h-3' },
    large: { outer: 'w-4 h-4', inner: 'w-4 h-4' },
    xlarge: { outer: 'w-5 h-5', inner: 'w-5 h-5' },
  };

  const currentSize = radioSizes[radioSize];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex w-full flex-col border rounded-sm py-3 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        soldOut || disabled
          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
          : selected
          ? 'bg-blue-50 border-blue-600 hover:bg-blue-50'
          : 'bg-white border-gray-300 hover:bg-gray-50'
      )}
    >
      {/* Badge */}
      {badge && (
        <span className="absolute -top-2 right-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
          {badge}
        </span>
      )}

      <div className="flex w-full items-center px-3">
        {/* Radio Icon */}
        <div className="shrink-0 flex items-center justify-center w-6 h-6">
          {colorSwatch ? (
            <div
              className="w-4 h-4 rounded-md border border-gray-300"
              style={{ backgroundColor: colorSwatch }}
            />
          ) : (
            <div className="relative flex items-center justify-center w-6 h-6">
              <div
                className={cn(
                  'rounded-full border-2 transition-all',
                  soldOut || disabled
                    ? `${currentSize.outer} bg-transparent border-gray-400`
                    : selected
                    ? `${currentSize.inner} bg-blue-600 border-blue-600`
                    : `${currentSize.outer} bg-transparent border-gray-400`
                )}
              />
            </div>
          )}
        </div>

        {/* Icon (optional) */}
        {icon && <div className="ml-3 shrink-0">{icon}</div>}

        {/* Content */}
        <div className="ml-4 flex-1 flex flex-col text-left">
          <div className={cn('flex items-start', layout === 'list' ? 'flex-row' : 'flex-col')}>
            <span
              className={cn(
                'mr-2 min-w-[100px] grow',
                soldOut || disabled
                  ? 'text-gray-500'
                  : selected
                  ? 'font-semibold text-gray-900'
                  : 'text-gray-900'
              )}
            >
              {label}
            </span>
            {displayPrice && (
              <span
                className={cn(
                  'text-sm shrink-0',
                  soldOut || disabled ? 'text-gray-500' : 'text-gray-600',
                  layout === 'list' && 'pt-0.5'
                )}
              >
                {displayPrice}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </button>
  );
}
