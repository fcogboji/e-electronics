'use client'

import { usePathname } from 'next/navigation'
import FadeCarousel from './EmblaCarouselComponent'

const slides = [
  { id: 1, imageUrl: '/images/car-promo.jpg', alt: 'image1' },
  { id: 2, imageUrl: '/images/event.jpg', alt: 'image2' },
  { id: 3, imageUrl: '/images/mi.jpg', alt: 'image3' },
  { id: 4, imageUrl: '/images/sking-care.jpeg', alt: 'image4' },
]

export default function CarouselWrapper() {
  const pathname = usePathname()
  const showCarousel = pathname === '/'

  return showCarousel ? <FadeCarousel slides={slides} /> : null
}
