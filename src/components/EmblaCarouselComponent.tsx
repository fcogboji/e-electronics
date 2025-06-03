'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

type SlideType = {
  id: number
  imageUrl: string
  alt: string
}

type PropType = {
  slides: SlideType[]
}

const FadeCarousel: React.FC<PropType> = ({ slides }) => {
  const [index, setIndex] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  useEffect(() => {
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 3000)

    return () => resetTimeout()
  }, [index, slides.length])

  const goToSlide = (i: number) => {
    resetTimeout()
    setIndex(i)
  }

  const goPrev = () => goToSlide((index - 1 + slides.length) % slides.length)
  const goNext = () => goToSlide((index + 1) % slides.length)

  return (
  <Link href="/promo">
        <section className="relative w-full max-w-6xl mx-auto mt-10 h-50 md:h-[18rem] overflow-hidden rounded-xl">
      {slides.map((slide, i) => (
        <img
          key={slide.id}
          src={slide.imageUrl}
          alt={slide.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow z-20"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow z-20"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full ${
              i === index ? 'bg-green-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  </Link>
  )
}

export default FadeCarousel
