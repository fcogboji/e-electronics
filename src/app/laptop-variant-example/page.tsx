'use client';

import { useState } from 'react';
import { ConditionSelector } from '@/components/product/ConditionSelector';
import { ProcessorSelector } from '@/components/product/ProcessorSelector';
import { MemorySelector } from '@/components/product/MemorySelector';
import { LaptopStorageSelector } from '@/components/product/LaptopStorageSelector';
import { LaptopColorSelector } from '@/components/product/LaptopColorSelector';

export default function LaptopVariantExample() {
  // State for selected options
  const [selectedCondition, setSelectedCondition] = useState('excellent');
  const [selectedProcessor, setSelectedProcessor] = useState('m2-pro-10');
  const [selectedMemory, setSelectedMemory] = useState('16gb');
  const [selectedStorage, setSelectedStorage] = useState('512gb');
  const [selectedColor, setSelectedColor] = useState('space-gray');

  // Laptop conditions - same as phone
  const conditions = [
    {
      id: 'fair',
      name: 'Fair',
      price: 849.0,
      features: ['Visible signs of use', 'Verified parts', 'Battery for daily use'],
      image: '/images/placeholder.svg',
    },
    {
      id: 'good',
      name: 'Good',
      price: 949.0,
      features: ['Light signs of use', 'Verified parts', 'Good battery life'],
      image: '/images/placeholder.svg',
    },
    {
      id: 'excellent',
      name: 'Excellent',
      price: 1149.0,
      features: ['Minimal signs of use', 'Verified parts', 'Excellent battery'],
      image: '/images/placeholder.svg',
      badge: 'Popular',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1349.0,
      features: ['Like new', 'Verified parts', 'Perfect battery'],
      image: '/images/placeholder.svg',
    },
  ];

  // Processor options
  const processorOptions = [
    {
      id: 'm2-max-12-30',
      name: 'Apple M2 Max 12-core - 30-core GPU',
      soldOut: true,
    },
    {
      id: 'm2-max-12-38',
      name: 'Apple M2 Max 12-core - 38-core GPU',
      price: 2495.0,
    },
    {
      id: 'm2-pro-10',
      name: 'Apple M2 Pro 10-core - 16-core GPU',
      price: 1149.0,
    },
    {
      id: 'm2-pro-12',
      name: 'Apple M2 Pro 12-core - 19-core GPU',
      price: 1231.0,
    },
  ];

  // Memory options
  const memoryOptions = [
    { id: '16gb', size: '16 GB', price: 1149.0 },
    { id: '32gb', size: '32 GB', soldOut: true },
    { id: '64gb', size: '64 GB', soldOut: true },
  ];

  // Storage options
  const storageOptions = [
    { id: '512gb', size: '512 GB', price: 1149.0 },
    { id: '1000gb', size: '1000 GB', price: 1281.0 },
  ];

  // Color options
  const colorOptions = [
    {
      id: 'space-gray',
      name: 'Space Gray',
      price: 1149.0,
      colorCode: '#B8BCBF',
      images: [
        '/images/placeholder.svg',
        '/images/placeholder.svg',
        '/images/placeholder.svg',
      ],
    },
    {
      id: 'silver',
      name: 'Silver',
      colorCode: '#DFDEE3',
      images: ['/images/placeholder.svg'],
      soldOut: true,
    },
  ];

  // Calculate total price based on selections
  const selectedConditionObj = conditions.find((c) => c.id === selectedCondition);
  const selectedProcessorObj = processorOptions.find((p) => p.id === selectedProcessor);
  const selectedMemoryObj = memoryOptions.find((m) => m.id === selectedMemory);
  const selectedStorageObj = storageOptions.find((s) => s.id === selectedStorage);
  const selectedColorObj = colorOptions.find((c) => c.id === selectedColor);

  const totalPrice =
    [
      selectedConditionObj?.price || 0,
      selectedProcessorObj?.price || 0,
      selectedMemoryObj?.price || 0,
      selectedStorageObj?.price || 0,
      selectedColorObj?.price || 0,
    ].reduce((a, b) => a + b, 0) / 5; // Average for demo purposes

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="text-4xl font-bold mb-2">MacBook Pro 14-inch (2023)</h1>
          <p className="text-xl text-gray-600">Configure your laptop</p>
        </div>

        {/* Variant Selectors */}
        <div className="max-w-7xl mx-auto">
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

        {/* Summary & Add to Cart */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold">£{totalPrice.toFixed(2)}</h3>
                <p className="text-sm text-gray-600">
                  {selectedConditionObj?.name} • {selectedProcessorObj?.name} • {selectedMemoryObj?.size} •{' '}
                  {selectedStorageObj?.size} • {selectedColorObj?.name}
                </p>
              </div>
              <button className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
