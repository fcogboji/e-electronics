'use client'

import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

type SlideType = {
  id: number
  imageUrl: string
  alt: string
}

type PropType = {
  slides: SlideType[]
  options?: EmblaOptionsType
}

const EmblaCarouselComponent: React.FC<PropType> = ({ slides, options }) => {
  const autoplay = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  const [emblaRef] = useEmblaCarousel(options, [autoplay.current])

  return (
    <section className="embla w-full max-w-4xl mx-auto mt-10">
      <div className="embla__viewport overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide) => (
            <div
              className="embla__slide flex-[0_0_100%] relative p-4 pt-8 box-border"
              key={slide.id}
            >
              <div className="w-full h-36 md:h-52 overflow-hidden rounded-xl shadow-md">
                <img
                  src={slide.imageUrl}
                  alt={slide.alt}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EmblaCarouselComponent
