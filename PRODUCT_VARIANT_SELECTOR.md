# Product Variant Selector Components

A complete set of Next.js 15+ components for selecting product variants (condition, storage, SIM type, color) with a BackMarket-inspired design.

## Features

- ✅ **Modern Design**: Clean, professional UI matching BackMarket's design pattern
- ✅ **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- ✅ **Image Carousels**: Interactive image galleries with thumbnails and navigation
- ✅ **Accessible**: Proper ARIA labels and keyboard navigation
- ✅ **TypeScript**: Full type safety
- ✅ **Next.js 15+ Compatible**: Uses latest Next.js features including Image optimization

## Components

### Mobile Phone Components

### 1. ConditionSelector
Select product condition (Fair, Good, Excellent, Premium) with image carousel showing condition details. **Works for both phones and laptops.**

### 2. StorageSelector
Select storage capacity with clean list layout for mobile phones.

### 3. SIMTypeSelector
Select SIM card type (eSIM, Physical SIM + eSIM) with informational tooltip.

### 4. ColorSelector
Select product color with color swatches and image carousel showing the selected color.

### Laptop Components

### 5. ProcessorSelector
Select laptop processor (CPU/GPU configuration) with informational tooltip and support for sold-out items.

### 6. MemorySelector
Select RAM/memory capacity with support for sold-out items.

### 7. LaptopStorageSelector
Select laptop storage capacity with support for sold-out items.

### 8. LaptopColorSelector
Select laptop color with color swatches, image carousel, and support for sold-out items.

### Shared Components

### 9. VariantOption
Reusable radio button component for all selectors with sold-out state support and variable radio sizes.

### 10. ImageCarousel
Image carousel with thumbnails, navigation arrows, and dot indicators.

## Installation

All components are already created in your project:

```
src/components/product/
├── VariantOption.tsx           # Shared component with sold-out support
├── ImageCarousel.tsx            # Shared component
├── ConditionSelector.tsx        # Shared (phones & laptops)
├── StorageSelector.tsx          # Mobile phones
├── SIMTypeSelector.tsx          # Mobile phones
├── ColorSelector.tsx            # Mobile phones
├── ProcessorSelector.tsx        # Laptops
├── MemorySelector.tsx           # Laptops
├── LaptopStorageSelector.tsx    # Laptops
├── LaptopColorSelector.tsx      # Laptops
└── index.ts
```

## Usage

### Mobile Phone Example

```tsx
'use client';

import { useState } from 'react';
import {
  ConditionSelector,
  StorageSelector,
  SIMTypeSelector,
  ColorSelector,
} from '@/components/product';

export default function ProductPage() {
  const [selectedCondition, setSelectedCondition] = useState('fair');
  const [selectedStorage, setSelectedStorage] = useState('128gb');
  const [selectedSIM, setSelectedSIM] = useState('physical-esim');
  const [selectedColor, setSelectedColor] = useState('blue');

  const conditions = [
    {
      id: 'fair',
      name: 'Fair',
      price: 273.00,
      features: ['Visible signs of use', 'Verified parts', 'Battery for daily use'],
      image: '/images/product-fair.jpg',
    },
    {
      id: 'excellent',
      name: 'Excellent',
      price: 351.00,
      features: ['Minimal signs of use', 'Verified parts', 'Excellent battery'],
      image: '/images/product-excellent.jpg',
      badge: 'Popular',
    },
  ];

  const storageOptions = [
    { id: '128gb', size: '128 GB', price: 273.00 },
    { id: '256gb', size: '256 GB', price: 319.00 },
  ];

  const simOptions = [
    {
      id: 'esim',
      type: 'eSIM',
      description: '2 virtual SIM slots (no physical SIM slot)',
      price: 366.00,
    },
    {
      id: 'physical-esim',
      type: 'Physical SIM + eSIM',
      description: '1 physical SIM + 1 virtual SIM slot',
      price: 273.00,
    },
  ];

  const colorOptions = [
    {
      id: 'blue',
      name: 'Blue',
      price: 273.00,
      colorCode: '#9CB0C4',
      images: [
        '/images/iphone-blue-1.jpg',
        '/images/iphone-blue-2.jpg',
        '/images/iphone-blue-3.jpg',
      ],
    },
    {
      id: 'red',
      name: 'Red',
      price: 274.00,
      colorCode: '#FF0000',
      images: ['/images/iphone-red-1.jpg'],
    },
  ];

  return (
    <div>
      <ConditionSelector
        conditions={conditions}
        selectedCondition={selectedCondition}
        onConditionChange={setSelectedCondition}
        productName="iPhone 14"
      />

      <StorageSelector
        options={storageOptions}
        selectedStorage={selectedStorage}
        onStorageChange={setSelectedStorage}
      />

      <SIMTypeSelector
        options={simOptions}
        selectedSIM={selectedSIM}
        onSIMChange={setSelectedSIM}
      />

      <ColorSelector
        options={colorOptions}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        productName="iPhone 14"
      />
    </div>
  );
}
```

### Laptop Example

```tsx
'use client';

import { useState } from 'react';
import {
  ConditionSelector,
  ProcessorSelector,
  MemorySelector,
  LaptopStorageSelector,
  LaptopColorSelector,
} from '@/components/product';

export default function LaptopProductPage() {
  const [selectedCondition, setSelectedCondition] = useState('excellent');
  const [selectedProcessor, setSelectedProcessor] = useState('m2-pro-10');
  const [selectedMemory, setSelectedMemory] = useState('16gb');
  const [selectedStorage, setSelectedStorage] = useState('512gb');
  const [selectedColor, setSelectedColor] = useState('space-gray');

  // Condition selector - same as phone
  const conditions = [
    {
      id: 'excellent',
      name: 'Excellent',
      price: 1149.00,
      features: ['Minimal signs of use', 'Verified parts', 'Excellent battery'],
      image: '/images/laptop-excellent.jpg',
      badge: 'Popular',
    },
  ];

  // Laptop-specific processor options
  const processorOptions = [
    {
      id: 'm2-max-12-30',
      name: 'Apple M2 Max 12-core - 30-core GPU',
      soldOut: true, // Sold out items are grayed out
    },
    {
      id: 'm2-pro-10',
      name: 'Apple M2 Pro 10-core - 16-core GPU',
      price: 1149.00,
    },
  ];

  // Memory (RAM) options
  const memoryOptions = [
    { id: '16gb', size: '16 GB', price: 1149.00 },
    { id: '32gb', size: '32 GB', soldOut: true },
  ];

  // Storage options
  const storageOptions = [
    { id: '512gb', size: '512 GB', price: 1149.00 },
    { id: '1000gb', size: '1000 GB', price: 1281.00 },
  ];

  // Color options with sold-out support
  const colorOptions = [
    {
      id: 'space-gray',
      name: 'Space Gray',
      price: 1149.00,
      colorCode: '#B8BCBF',
      images: ['/images/macbook-gray-1.jpg', '/images/macbook-gray-2.jpg'],
    },
    {
      id: 'silver',
      name: 'Silver',
      colorCode: '#DFDEE3',
      images: ['/images/macbook-silver-1.jpg'],
      soldOut: true,
    },
  ];

  return (
    <div>
      <ConditionSelector
        conditions={conditions}
        selectedCondition={selectedCondition}
        onConditionChange={setSelectedCondition}
        productName="MacBook Pro 14-inch"
      />

      <ProcessorSelector
        options={processorOptions}
        selectedProcessor={selectedProcessor}
        onProcessorChange={setSelectedProcessor}
      />

      <MemorySelector
        options={memoryOptions}
        selectedMemory={selectedMemory}
        onMemoryChange={setSelectedMemory}
      />

      <LaptopStorageSelector
        options={storageOptions}
        selectedStorage={selectedStorage}
        onStorageChange={setSelectedStorage}
      />

      <LaptopColorSelector
        options={colorOptions}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        productName="MacBook Pro 14-inch"
      />
    </div>
  );
}
```

## Component Props

### ConditionSelector

```tsx
interface ConditionInfo {
  id: string;
  name: string;
  price: number;
  features: string[];
  image: string;
  badge?: string;
}

interface ConditionSelectorProps {
  conditions: ConditionInfo[];
  selectedCondition: string;
  onConditionChange: (conditionId: string) => void;
  productName: string;
}
```

### StorageSelector

```tsx
interface StorageOption {
  id: string;
  size: string;
  price: number;
}

interface StorageSelectorProps {
  options: StorageOption[];
  selectedStorage: string;
  onStorageChange: (storageId: string) => void;
}
```

### SIMTypeSelector

```tsx
interface SIMOption {
  id: string;
  type: string;
  description: string;
  price: number;
}

interface SIMTypeSelectorProps {
  options: SIMOption[];
  selectedSIM: string;
  onSIMChange: (simId: string) => void;
}
```

### ColorSelector

```tsx
interface ColorOption {
  id: string;
  name: string;
  price: number;
  colorCode: string; // Hex color code
  images: string[];
}

interface ColorSelectorProps {
  options: ColorOption[];
  selectedColor: string;
  onColorChange: (colorId: string) => void;
  productName: string;
}
```

### ProcessorSelector (Laptops)

```tsx
interface ProcessorOption {
  id: string;
  name: string;
  price?: number;
  soldOut?: boolean;
}

interface ProcessorSelectorProps {
  options: ProcessorOption[];
  selectedProcessor: string;
  onProcessorChange: (processorId: string) => void;
}
```

### MemorySelector (Laptops)

```tsx
interface MemoryOption {
  id: string;
  size: string;
  price?: number;
  soldOut?: boolean;
}

interface MemorySelectorProps {
  options: MemoryOption[];
  selectedMemory: string;
  onMemoryChange: (memoryId: string) => void;
}
```

### LaptopStorageSelector

```tsx
interface LaptopStorageOption {
  id: string;
  size: string;
  price?: number;
  soldOut?: boolean;
}

interface LaptopStorageSelectorProps {
  options: LaptopStorageOption[];
  selectedStorage: string;
  onStorageChange: (storageId: string) => void;
}
```

### LaptopColorSelector

```tsx
interface LaptopColorOption {
  id: string;
  name: string;
  price?: number;
  colorCode: string; // Hex color code
  images: string[];
  soldOut?: boolean;
}

interface LaptopColorSelectorProps {
  options: LaptopColorOption[];
  selectedColor: string;
  onColorChange: (colorId: string) => void;
  productName: string;
}
```

## Demo Pages

### Mobile Phone Example
A complete working example is available at:
```
src/app/product-variant-example/page.tsx
```

Visit `/product-variant-example` to see mobile phone selectors in action.

### Laptop Example
A complete working example is available at:
```
src/app/laptop-variant-example/page.tsx
```

Visit `/laptop-variant-example` to see laptop selectors with sold-out items in action.

## Customization

### Styling
All components use Tailwind CSS classes. You can customize the appearance by modifying the classes in each component file.

### Layout
- **Desktop**: Side-by-side layout with image on the left, options on the right
- **Mobile**: Stacked layout with image above options

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Integration with Your Product Data

To integrate with your existing product system:

1. **Map your product variants** to the required data structures
2. **Update image paths** to match your product images
3. **Connect to your cart system** in the selection handlers
4. **Add price calculation logic** based on selected variants

Example integration:

```tsx
// Fetch product data
const product = await getProduct(productId);

// Map variants
const conditions = product.variants.map(v => ({
  id: v.id,
  name: v.condition,
  price: v.price,
  features: v.features,
  image: v.image,
  badge: v.popular ? 'Popular' : undefined,
}));

// Handle selection
const handleConditionChange = (conditionId: string) => {
  setSelectedCondition(conditionId);
  // Update cart or URL params
  updateProductVariant({ condition: conditionId });
};
```

## Best Practices

1. **Image Optimization**: Use Next.js Image component for automatic optimization
2. **State Management**: Use URL params to persist selections across page reloads
3. **Loading States**: Add skeleton loaders while fetching product data
4. **Error Handling**: Show fallback UI if product data fails to load
5. **Analytics**: Track variant selections for business insights
6. **Sold-Out Items**: Mark items as `soldOut: true` to gray them out and prevent selection
7. **Radio Sizes**: The laptop selectors automatically scale radio button sizes based on position (small → medium → large → xlarge)

## Dependencies

Required packages (already in your project):
- `next` (v15+)
- `react`
- `tailwindcss`
- `lucide-react` (for icons)
- `clsx` and `tailwind-merge` (for className utilities)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

All components follow WCAG 2.1 AA standards:
- Proper ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support

## License

MIT
