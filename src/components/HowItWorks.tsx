'use client';

import { motion } from 'framer-motion';
import { Search, CreditCard, Package, Home } from 'lucide-react';

const steps = [
  {
    number: '1️⃣',
    title: 'Browse your favourite gadgets',
    description: 'Explore our wide selection of premium UK-used phones and laptops',
    icon: Search,
    color: 'from-blue-500 to-blue-600'
  },
  {
    number: '2️⃣',
    title: 'Make payment securely',
    description: 'Pay safely using Paystack or Bank Transfer',
    icon: CreditCard,
    color: 'from-green-500 to-green-600'
  },
  {
    number: '3️⃣',
    title: 'We buy it in the UK and ship directly to you',
    description: 'We source authentic UK devices and ship them straight to Nigeria',
    icon: Package,
    color: 'from-purple-500 to-purple-600'
  },
  {
    number: '4️⃣',
    title: 'Receive your order at home',
    description: 'Get your device delivered within 7–14 days',
    icon: Home,
    color: 'from-orange-500 to-orange-600'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting your premium UK-used gadget delivered to Nigeria is easy!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                <div className="text-4xl mb-3 text-center">{step.number}</div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>

                <p className="text-gray-600 text-center">
                  {step.description}
                </p>
              </div>

              {/* Arrow connector for larger screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16H28M28 16L20 8M28 16L20 24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="#products-section"
            onClick={(e) => {
              e.preventDefault();
              const productsSection = document.getElementById('products-section');
              productsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start Shopping Now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
