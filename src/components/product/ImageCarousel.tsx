'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* Main Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg md:rounded-[32px]">
        <div className="relative aspect-square w-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Image
                src={image}
                alt={`${alt} - Image ${index + 1}`}
                fill
                className="object-cover rounded-lg md:rounded-[32px]"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 498px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {images.length > 1 && (
        <div className="relative flex items-center justify-center gap-3">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Thumbnails */}
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === currentIndex}
                className={cn(
                  'relative h-10 w-10 overflow-hidden rounded-sm border-2 transition-all',
                  index === currentIndex
                    ? 'border-gray-900 opacity-100'
                    : 'border-gray-300 opacity-50 hover:opacity-75'
                )}
              >
                <Image src={image} alt={`${alt} thumbnail ${index + 1}`} fill className="object-cover" sizes="40px" />
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={goToNext}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Dot Indicators (for mobile) */}
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentIndex ? 'bg-gray-900 w-6' : 'bg-gray-300'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
