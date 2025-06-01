// src/components/CarouselWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import EmblaCarouselComponent from './EmblaCarouselComponent';

const slides = [
  { id: 1, imageUrl: '/images/slide1.jpg', alt: 'Fresh Vegetables' },
  { id: 2, imageUrl: '/images/slide2.jpg', alt: 'Organic Fruits' },
  { id: 3, imageUrl: '/images/slide3.jpg', alt: 'Local Farms' },
];

export default function CarouselWrapper() {
  const pathname = usePathname();

  // Show only on homepage
  const showCarousel = pathname === '/';

  return showCarousel ? <EmblaCarouselComponent slides={slides} /> : null;
}
