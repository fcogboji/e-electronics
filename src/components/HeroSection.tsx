'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const slides = [
  {
    type: 'main',
    gradient: 'from-green-500 to-blue-600',
    title: 'Premium UK-Used Phones & Laptops',
    subtitle: 'Delivered to Your Door in Nigeria',
    hasButtons: true
  },
  {
    type: 'image',
    src: '/images/s25ultrabanner.jpg',
    alt: 'Samsung S25 Ultra',
    gradient: 'from-green-600 to-blue-700',
    title: 'Samsung Galaxy S25 Ultra',
    subtitle: 'Experience the future of mobile technology',
    productId: 'cmg3v4ufd0000sbqqw1mccshj'
  },
  {
    type: 'image',
    src: '/images/oppo1.jpg',
    alt: 'oppo a5',
    gradient: 'from-green-600 to-blue-700',
    title: 'oppo A5',
    subtitle: 'Innovation at your fingertips',
    productId: 'cmg3u1n6j0000sbia0khozio4'
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleBuyNow = () => {
    const slide = slides[currentSlide];
    if (slide.productId) {
      router.push(`/product/${slide.productId}`);
    }
  };

  return (
    <div className="relative h-[50vh] sm:h-[45vh] md:h-[40vh] lg:h-[50vh] overflow-hidden bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {slides[currentSlide].type === 'main' ? (
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient}`} />
          ) : slides[currentSlide].src ? (
            <>
              <Image
                src={slides[currentSlide].src}
                alt={slides[currentSlide].alt || 'Hero slide'}
                fill
                className="object-cover"
                priority
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient} opacity-40`} />
            </>
          ) : null}

          {/* Centered Text Content and Buy Now Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center px-6 sm:px-6 md:px-8 max-w-4xl"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 drop-shadow-lg">
                {slides[currentSlide].subtitle}
              </p>

              {slides[currentSlide].hasButtons ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-2">
                  <motion.button
                    onClick={() => {
                      const productsSection = document.getElementById('products-section');
                      productsSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-gray-900 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold shadow-2xl hover:bg-gray-100 transition-all duration-300"
                  >
                    Shop Now
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/track-order')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent border-2 border-white text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold shadow-2xl hover:bg-white hover:text-gray-900 transition-all duration-300"
                  >
                    Track Order
                  </motion.button>
                </div>
              ) : slides[currentSlide].productId ? (
                <motion.button
                  onClick={handleBuyNow}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-gray-900 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold shadow-2xl hover:bg-gray-100 transition-all duration-300 w-full sm:w-auto max-w-xs"
                >
                  Buy Now
                </motion.button>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-2.5 md:p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-2.5 md:p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 5, 0, -5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-20 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm hidden lg:block"
      />

      <motion.div
        animate={{
          y: [10, -10, 10],
          rotate: [0, -5, 0, 5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-32 left-10 w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm hidden lg:block"
      />
    </div>
  );
};

export default HeroSection;