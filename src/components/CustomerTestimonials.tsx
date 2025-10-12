'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Tunde',
    location: 'Lagos',
    text: 'Got my iPhone 13 from them, authentic UK-used and works perfectly!',
    rating: 5,
    image: '👨🏿‍💼'
  },
  {
    id: 2,
    name: 'Chidinma',
    location: 'Abuja',
    text: 'Delivery took 9 days to Abuja. Excellent service.',
    rating: 5,
    image: '👩🏿‍💼'
  },
  {
    id: 3,
    name: 'Emeka',
    location: 'Port Harcourt',
    text: 'Quality is top-notch! My MacBook Pro arrived in perfect condition.',
    rating: 5,
    image: '👨🏿'
  },
  {
    id: 4,
    name: 'Funke',
    location: 'Ibadan',
    text: 'Best place to get genuine UK phones. No fake "London-used" here!',
    rating: 5,
    image: '👩🏿'
  }
];

export default function CustomerTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Customer Testimonials
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Nigeria
          </p>
        </motion.div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <Quote className="w-8 h-8 text-blue-200 mb-2" />

              <p className="text-gray-700 italic">
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-5xl">{testimonials[currentIndex].image}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {testimonials[currentIndex].name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {testimonials[currentIndex].location}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <Quote className="w-10 h-10 text-blue-200 mb-3" />

              <p className="text-gray-700 italic text-lg">
                "{testimonials[currentIndex].text}"
              </p>
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-2xl font-bold text-gray-900 mb-2">
            Join 5,000+ Smart Nigerian Buyers
          </p>
          <p className="text-lg text-gray-600">
            Never buy fake "London-used" again — shop genuine UK stock only.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
