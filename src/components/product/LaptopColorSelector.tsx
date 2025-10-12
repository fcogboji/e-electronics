'use client';

import { VariantOption } from './VariantOption';
import { ImageCarousel } from './ImageCarousel';

interface LaptopColorOption {
  id: string;
  name: string;
  price?: number;
  colorCode: string;
  images: string[];
  soldOut?: boolean;
}

interface LaptopColorSelectorProps {
  options: LaptopColorOption[];
  selectedColor: string;
  onColorChange: (colorId: string) => void;
  productName: string;
}

export function LaptopColorSelector({
  options,
  selectedColor,
  onColorChange,
  productName,
}: LaptopColorSelectorProps) {
  const selectedOption = options.find((opt) => opt.id === selectedColor);
  const images = selectedOption?.images || [];

  return (
    <aside className="py-12 md:py-16">
      <div className="md:flex md:justify-center md:items-start">
        {/* Image Section */}
        <div className="max-w-full md:relative md:mr-8 md:min-w-[337px] md:max-w-[498px] md:grow lg:mr-16">
          <div className="flex w-full flex-col justify-center">
            {/* Desktop Image Carousel */}
            <div className="hidden md:block mb-4">
              <ImageCarousel images={images} alt={`${productName} - ${selectedOption?.name}`} />
            </div>

            {/* Mobile Header */}
            <div className="flex md:hidden mb-4">
              <h2 className="text-2xl font-bold">Select the colour</h2>
            </div>
          </div>
        </div>

        {/* Selection Section */}
        <div className="md:w-[360px] md:shrink-0 min-[900px]:w-[456px]">
          <div>
            <fieldset role="radiogroup">
              <legend className="mb-3 hidden md:flex items-baseline justify-between">
                <h2 className="text-2xl font-bold">Select the colour</h2>
              </legend>

              {/* Mobile Image Carousel */}
              <div className="block md:hidden mb-6">
                <ImageCarousel images={images} alt={`${productName} - ${selectedOption?.name}`} />
              </div>

              {/* Options Grid */}
              <ul className="list-none grid grid-cols-2 gap-3">
                {options.map((option) => (
                  <li key={option.id}>
                    <VariantOption
                      label={option.name}
                      price={option.price ? `£${option.price.toFixed(2)}` : undefined}
                      selected={selectedColor === option.id}
                      onClick={() => !option.soldOut && onColorChange(option.id)}
                      colorSwatch={option.colorCode}
                      soldOut={option.soldOut}
                      disabled={option.soldOut}
                    />
                  </li>
                ))}
              </ul>
            </fieldset>
          </div>
        </div>
      </div>
    </aside>
  );
}
