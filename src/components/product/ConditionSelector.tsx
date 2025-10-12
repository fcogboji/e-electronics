'use client';

import { useState } from 'react';
import { VariantOption } from './VariantOption';
import { Check, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const conditionSlides = [
  {
    title: 'Body',
    features: [
      { icon: '✓', text: 'Visible signs of use' },
      { icon: '✓', text: 'Verified parts' },
      { icon: '⚡', text: 'Battery for daily use' },
    ],
  },
  {
    title: 'Screen',
    features: [
      { icon: '✓', text: 'May have micro-scratches' },
      { icon: '✓', text: 'Verified parts' },
    ],
  },
];

export function ConditionSelector({
  conditions,
  selectedCondition,
  onConditionChange,
  productName,
}: ConditionSelectorProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? conditionSlides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === conditionSlides.length - 1 ? 0 : prev + 1));
  };

  return (
    <aside className="py-32 md:py-24">
      <div className="md:flex md:justify-center md:items-center">
        {/* Left Side - Desktop Image Carousel */}
        <div className="max-w-full md:relative md:mr-32 md:min-w-[337px] md:max-w-[498px] md:grow lg:mr-64">
          <div className="flex w-full flex-col justify-center opacity-100 transition-opacity duration-500 ease-out motion-reduce:transition-none">
            {/* Desktop Only Carousel */}
            <div className="hidden md:block">
              <div className="relative mx-auto mb-16 max-w-[498px] md:mb-0 md:block md:w-full md:min-w-[337px]">
                <div className="relative -mb-4 flex min-h-72 flex-col flex-wrap overflow-hidden w-full pb-4">
                  <div className="relative flex w-full grow justify-center">
                    <ul className="w-full list-none">
                      {conditionSlides.map((slide, index) => (
                        <li
                          key={index}
                          aria-hidden={index !== currentSlide}
                          className={cn(
                            'flex w-full list-none justify-center motion-safe:animate-fade-in',
                            index === currentSlide ? 'block' : 'hidden'
                          )}
                        >
                          <div className="rounded-lg relative flex w-full md:rounded-[32px]">
                            <Image
                              src="/images/placeholder.svg"
                              alt={slide.title}
                              width={498}
                              height={498}
                              className="rounded-lg h-auto w-full md:min-w-[337px] md:max-w-[498px] md:rounded-[32px] h-auto max-h-full max-w-full leading-none"
                            />
                            <div className="caption bg-static-default-low absolute right-12 top-12 px-4">
                              <span>Example image</span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 flex flex-col p-16 md:flex-row md:flex-wrap md:items-center md:rounded-b-[32px] md:pb-24 md:pl-32 md:pt-48 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg md:rounded-b-[32px]">
                              <p className="text-static-light-hi text-white text-2xl font-bold mr-8 mt-8">
                                <span>{slide.title}</span>
                              </p>
                              <div className="flex grow flex-row flex-wrap">
                                {slide.features.map((feature, i) => (
                                  <div
                                    key={i}
                                    className="bg-static-default-low bg-white/90 rounded-full mr-8 mt-8 flex w-fit items-center p-4 pr-8 text-center md:body-2"
                                  >
                                    <span className="ml-4 text-left">{feature.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Desktop Carousel Controls */}
                <div className="mx-auto mt-16 flex w-full max-w-[1072px] items-center px-12">
                  <div className="mx-auto md:mx-0">
                    <ul className="flex list-none flex-row gap-8 overflow-hidden py-4 justify-center -mx-4 p-4">
                      {conditionSlides.map((_, index) => (
                        <li key={index} className="flex">
                          <div>
                            <button
                              aria-current={index === currentSlide}
                              aria-label={`Controller ${index + 1}`}
                              className="flex focus-visible-outline-default-hi rounded-sm size-8"
                              type="button"
                              onClick={() => setCurrentSlide(index)}
                            >
                              <div
                                className={cn(
                                  'appearance-none overflow-hidden no-underline transition-colors motion-reduce:transition-none rounded-full size-8 border',
                                  index === currentSlide
                                    ? 'border-action-default-hi bg-blue-600 hover:bg-blue-700'
                                    : 'border-action-default-hi bg-gray-200 hover:bg-gray-300'
                                )}
                              />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="hidden gap-12 md:flex ml-auto">
                    <button
                      aria-label="Previous - Scroll carousel left"
                      className="rounded-full flex shrink-0 cursor-pointer items-center justify-center border-0 no-underline disabled:cursor-not-allowed size-40 bg-gray-900 text-white hover:bg-gray-700"
                      type="button"
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      aria-label="Next - Scroll carousel right"
                      className="rounded-full flex shrink-0 cursor-pointer items-center justify-center border-0 no-underline disabled:cursor-not-allowed size-40 bg-gray-900 text-white hover:bg-gray-700"
                      type="button"
                      onClick={goToNext}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Header and Subtitle */}
            <div className="flex md:hidden">
              <h2 className="text-2xl font-bold">
                <span>Select the&nbsp;condition</span>
              </h2>
              <button className="body-2-link relative bottom-2 block pl-12 md:hidden text-blue-600 rounded-sm cursor-pointer underline hover:text-blue-700" type="button">
                Compare
              </button>
            </div>
            <div>
              <p className="mb-16 block md:hidden text-sm text-gray-600">All guaranteed 100% functional</p>
            </div>
          </div>
        </div>

        {/* Right Side - Condition Selection */}
        <div className="md:w-[360px] md:shrink-0 min-[900px]:w-[456px]">
          <div className="opacity-100 transition-opacity duration-500 ease-out motion-reduce:transition-none">
            <fieldset role="radiogroup">
              <legend className="mb-12 hidden items-baseline justify-between md:flex">
                <h2 className="text-2xl font-bold">
                  <span>Select the&nbsp;condition</span>
                </h2>
                <button className="body-2-link relative bottom-2 block pl-12 md:hidden text-blue-600 rounded-sm cursor-pointer underline hover:text-blue-700" type="button">
                  Compare
                </button>
              </legend>

              {/* Mobile carousel */}
              <div className="relative block md:hidden">
                <div className="relative mx-auto mb-16 max-w-[498px] md:mb-0 md:block md:w-full md:min-w-[337px]">
                  <div className="relative -mb-4 flex min-h-72 flex-col flex-wrap overflow-hidden w-full pb-4">
                    <div className="relative flex w-full grow justify-center">
                      <ul className="w-full list-none">
                        {conditionSlides.map((slide, index) => (
                          <li
                            key={index}
                            aria-hidden={index !== currentSlide}
                            className={cn(
                              'flex w-full list-none justify-center motion-safe:animate-fade-in',
                              index === currentSlide ? 'block' : 'hidden'
                            )}
                          >
                            <div className="rounded-lg relative flex w-full">
                              <Image
                                src="/images/placeholder.svg"
                                alt={slide.title}
                                width={498}
                                height={498}
                                className="rounded-lg h-auto w-full"
                              />
                              <div className="caption bg-white/90 absolute right-12 top-12 px-4">
                                <span>Example image</span>
                              </div>
                              <div className="absolute inset-x-0 bottom-0 flex flex-col p-16 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-xl font-bold mr-8 mt-8">
                                  <span>{slide.title}</span>
                                </p>
                                <div className="flex grow flex-row flex-wrap">
                                  {slide.features.map((feature, i) => (
                                    <div
                                      key={i}
                                      className="bg-white/90 rounded-full mr-8 mt-8 flex w-fit items-center p-4 pr-8 text-center text-xs"
                                    >
                                      <span className="ml-4 text-left">{feature.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Mobile Controls */}
                  <div className="mx-auto mt-16 flex w-full items-center px-12">
                    <div className="mx-auto">
                      <ul className="flex list-none flex-row gap-8 py-4 justify-center -mx-4 p-4">
                        {conditionSlides.map((_, index) => (
                          <li key={index} className="flex">
                            <div>
                              <button
                                aria-current={index === currentSlide}
                                aria-label={`Controller ${index + 1}`}
                                className="flex rounded-sm size-8"
                                type="button"
                                onClick={() => setCurrentSlide(index)}
                              >
                                <div
                                  className={cn(
                                    'rounded-full size-8 border transition-colors',
                                    index === currentSlide
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'bg-gray-200 border-gray-400'
                                  )}
                                />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info card */}
              <button className="hidden md:flex mb-6 w-full items-center gap-3 rounded-lg bg-blue-50 p-4 text-left hover:bg-blue-100 transition-colors border border-blue-200">
                <Sparkles className="h-8 w-8 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Refurbishers have restored devices to high quality based on a 25-point inspection. Compare conditions
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
              </button>

              {/* Options Grid */}
              <ul className="list-none grid grid-cols-2 gap-3">
                {conditions.map((condition) => (
                  <li key={condition.id}>
                    <VariantOption
                      label={condition.name}
                      price={`£${condition.price.toFixed(2)}`}
                      selected={selectedCondition === condition.id}
                      onClick={() => onConditionChange(condition.id)}
                      badge={condition.badge}
                      icon={
                        condition.name === 'Premium' ? (
                          <Image src="/images/placeholder.svg" alt="Premium" width={24} height={24} />
                        ) : undefined
                      }
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
