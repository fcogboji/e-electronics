'use client';

import { VariantOption } from './VariantOption';
import Image from 'next/image';

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

export function StorageSelector({ options, selectedStorage, onStorageChange }: StorageSelectorProps) {
  return (
    <aside className="py-12 md:py-16">
      <div className="md:flex md:justify-center md:items-start">
        {/* Image Section */}
        <div className="max-w-full md:relative md:mr-8 md:min-w-[337px] md:max-w-[498px] md:grow lg:mr-16">
          <div className="flex w-full flex-col justify-center">
            {/* Mobile Header */}
            <div className="flex md:hidden mb-4">
              <h2 className="text-2xl font-bold">Select storage</h2>
            </div>

            {/* Image */}
            <div className="relative rounded-lg md:rounded-[32px] mb-6 mt-4 overflow-hidden">
              <Image
                src="/images/placeholder.svg"
                alt="Storage"
                width={498}
                height={498}
                className="block w-full h-auto rounded-lg md:rounded-[32px]"
              />
            </div>
          </div>
        </div>

        {/* Selection Section */}
        <div className="md:w-[360px] md:shrink-0 min-[900px]:w-[456px]">
          <div>
            <fieldset role="radiogroup">
              <legend className="mb-3 hidden md:flex items-baseline justify-between">
                <h2 className="text-2xl font-bold">Select storage</h2>
              </legend>

              {/* Options List */}
              <ul className="list-none grid gap-y-3">
                {options.map((option) => (
                  <li key={option.id}>
                    <VariantOption
                      label={option.size}
                      price={`£${option.price.toFixed(2)}`}
                      selected={selectedStorage === option.id}
                      onClick={() => onStorageChange(option.id)}
                      layout="list"
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
