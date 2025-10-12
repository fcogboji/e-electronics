'use client';

import { VariantOption } from './VariantOption';
import { ChevronRight, Info } from 'lucide-react';
import Image from 'next/image';

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

export function SIMTypeSelector({ options, selectedSIM, onSIMChange }: SIMTypeSelectorProps) {
  return (
    <aside className="py-12 md:py-16">
      <div className="md:flex md:justify-center md:items-start">
        {/* Image Section */}
        <div className="max-w-full md:relative md:mr-8 md:min-w-[337px] md:max-w-[498px] md:grow lg:mr-16">
          <div className="flex w-full flex-col justify-center">
            {/* Mobile Header */}
            <div className="flex md:hidden mb-4">
              <h2 className="text-2xl font-bold">Select SIM card type</h2>
            </div>

            {/* Image */}
            <div className="relative rounded-lg md:rounded-[32px] mb-6 mt-4 overflow-hidden">
              <Image
                src="/images/placeholder.svg"
                alt="SIM card"
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
                <h2 className="text-2xl font-bold">Select SIM card type</h2>
              </legend>

              {/* Info card */}
              <button className="mb-6 flex w-full items-center gap-3 rounded-lg bg-blue-50 p-4 text-left hover:bg-blue-100 transition-colors border border-blue-200">
                <Info className="h-8 w-8 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    A SIM allows you to activate a phone plan from your carrier and holds information like your phone number.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
              </button>

              {/* Options List */}
              <ul className="list-none grid gap-y-3">
                {options.map((option) => (
                  <li key={option.id}>
                    <VariantOption
                      label={option.type}
                      price={`£${option.price.toFixed(2)}`}
                      description={option.description}
                      selected={selectedSIM === option.id}
                      onClick={() => onSIMChange(option.id)}
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
