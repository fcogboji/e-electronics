# Laptop Variant Selectors - Summary

## What's New

I've extended your product variant selector system to fully support laptops with the following new components:

### New Laptop Components

1. **ProcessorSelector** - Select CPU/GPU configurations
   - Supports sold-out processors
   - Info tooltip about processor selection
   - Progressive radio sizes (small → xlarge)

2. **MemorySelector** - Select RAM capacity
   - Supports sold-out memory options
   - Progressive radio sizes

3. **LaptopStorageSelector** - Select storage capacity
   - Supports sold-out storage options
   - Progressive radio sizes

4. **LaptopColorSelector** - Select laptop color
   - Image carousel with product photos
   - Color swatches
   - Supports sold-out colors

### Enhanced Shared Components

**VariantOption** - Updated with:
- `soldOut` prop - Grays out and disables sold-out items
- `radioSize` prop - Variable radio button sizes ('small' | 'medium' | 'large' | 'xlarge')
- Automatic "Sold out" text display
- Proper disabled styling

**ConditionSelector** - Works for both phones and laptops (unchanged)

## Key Features

✅ **Sold-Out Support** - Items marked as sold-out are:
  - Grayed out with reduced opacity
  - Non-clickable (disabled state)
  - Show "Sold out" instead of price
  - Have proper ARIA attributes

✅ **Progressive Radio Sizes** - Radio buttons grow larger based on list position:
  - 1st item: Small radio
  - 2nd item: Medium radio
  - 3rd item: Large radio
  - 4th item: Extra-large radio

✅ **Consistent Design** - Matches BackMarket's design pattern exactly

## Usage Example

```tsx
import {
  ConditionSelector,
  ProcessorSelector,
  MemorySelector,
  LaptopStorageSelector,
  LaptopColorSelector,
} from '@/components/product';

// In your component:
const processorOptions = [
  {
    id: 'm2-max-12-30',
    name: 'Apple M2 Max 12-core - 30-core GPU',
    soldOut: true, // This will be grayed out
  },
  {
    id: 'm2-pro-10',
    name: 'Apple M2 Pro 10-core - 16-core GPU',
    price: 1149.00,
  },
];

<ProcessorSelector
  options={processorOptions}
  selectedProcessor={selectedProcessor}
  onProcessorChange={setSelectedProcessor}
/>
```

## Demo Pages

1. **Mobile Phone**: `/product-variant-example`
   - Condition, Storage, SIM Type, Color

2. **Laptop**: `/laptop-variant-example`
   - Condition, Processor, Memory, Storage, Color
   - Demonstrates sold-out functionality

## File Structure

```
src/components/product/
├── ProcessorSelector.tsx        # NEW
├── MemorySelector.tsx           # NEW
├── LaptopStorageSelector.tsx    # NEW
├── LaptopColorSelector.tsx      # NEW
├── VariantOption.tsx            # UPDATED (sold-out support)
├── ConditionSelector.tsx        # Shared
├── StorageSelector.tsx          # Phone only
├── SIMTypeSelector.tsx          # Phone only
├── ColorSelector.tsx            # Phone only
├── ImageCarousel.tsx            # Shared
└── index.ts                     # Updated exports

src/app/
├── product-variant-example/     # Phone demo
└── laptop-variant-example/      # Laptop demo (NEW)
```

## Product Type Detection

To use the right selectors based on product type:

```tsx
const productType = product.category; // 'phone' or 'laptop'

{productType === 'laptop' ? (
  <>
    <ProcessorSelector {...} />
    <MemorySelector {...} />
    <LaptopStorageSelector {...} />
    <LaptopColorSelector {...} />
  </>
) : (
  <>
    <StorageSelector {...} />
    <SIMTypeSelector {...} />
    <ColorSelector {...} />
  </>
)}

{/* Condition selector works for both */}
<ConditionSelector {...} />
```

## Important Notes

1. **Sold-Out Logic**: When an item is sold-out:
   ```tsx
   onClick={() => !option.soldOut && onOptionChange(option.id)}
   disabled={option.soldOut}
   ```

2. **Radio Size Progression**: Automatically calculated in each laptop selector:
   ```tsx
   const radioSizes = ['small', 'medium', 'large', 'xlarge'];
   const radioSize = radioSizes[Math.min(index, radioSizes.length - 1)];
   ```

3. **Price Display**: Automatically shows "Sold out" instead of price when `soldOut: true`

## Testing

Visit these URLs to test:
- `/product-variant-example` - Mobile phone configuration
- `/laptop-variant-example` - Laptop configuration with sold-out items

## Next Steps

To integrate into your actual product pages:

1. Fetch product data including variant options
2. Map variants to the component data structures
3. Handle sold-out logic based on inventory
4. Add URL params to persist selections
5. Connect to your cart system

See `PRODUCT_VARIANT_SELECTOR.md` for complete documentation!
