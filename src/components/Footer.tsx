
'use client';
import Link from 'next/link';

import { useState } from 'react';
import Image from 'next/image'

 const year = new Date().getFullYear();
  const name = "🇬🇧 UK2Naija Gadgets";

export default function Footer() {
  const [email, setEmail] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubscribe = () => {
    if (email && agreedToPrivacy && agreedToTerms) {
      console.log('Subscribed:', email);
      // Add your subscription logic here
      setEmail('');
      setAgreedToPrivacy(false);
      setAgreedToTerms(false);
      alert('Thank you for subscribing!');
    } else {
      alert('Please fill in all fields and agree to the terms.');
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold mb-4">New to UK2Naija Gadgets?</h3>
            <p className="text-gray-300 mb-6">Subscribe to our newsletter to get updates on our latest offers!</p>
            
            <div className="max-w-md mx-auto md:mx-0">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
                <button
                  onClick={handleSubscribe}
                  type="button"
                  className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Subscribe
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-1 accent-yellow-500"
                  />
                  <span>I agree to UK2Naija Gadgets' Privacy and Cookie Policy. You can unsubscribe from newsletters at any time.</span>
                </label>
                
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 accent-yellow-500"
                  />
                  <span>I accept the Legal Terms</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Download App Section */}
         {/* Download Section */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400">DOWNLOAD UK2NAIJA FREE APP</h3>
          <p className="text-gray-300 mb-3">Get access to exclusive offers!</p>
          <div className="flex justify-center md:justify-start gap-3">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
              <Image src="/images/google-play-badge.png" alt="Get it on Google Play" width={140} height={42} />
            </a>
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
              <Image src="/images/app-store-badge.svg" alt="Download on the App Store" width={140} height={42} />
            </a>
          </div>
        </div>

          {/* Need Help Section */}
         

          {/* Useful Links */}
          

          {/* About ElectroShop */}
         
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-700">
          
          {/* Make Money */}
          

          {/* International */}
          

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">JOIN US ON</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <a href="https://facebook.com" className="text-2xl hover:text-yellow-400 transition-colors">📘</a>
              <a href="https://twitter.com" className="text-2xl hover:text-yellow-400 transition-colors">🐦</a>
              <a href="https://instagram.com" className="text-2xl hover:text-yellow-400 transition-colors">📷</a>
              <a href="https://youtube.com" className="text-2xl hover:text-yellow-400 transition-colors">📺</a>
              <a href="https://linkedin.com" className="text-2xl hover:text-yellow-400 transition-colors">💼</a>
              <a href="https://tiktok.com" className="text-2xl hover:text-yellow-400 transition-colors">🎵</a>
            </div>
            
            <h4 className="font-semibold mb-3 text-yellow-400">PAYMENT METHODS & PARTNERS</h4>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white px-3 py-1 rounded text-black text-xs font-semibold">VISA</div>
              <div className="bg-white px-3 py-1 rounded text-black text-xs font-semibold">MASTERCARD</div>
              <div className="bg-white px-3 py-1 rounded text-black text-xs font-semibold">PAYPAL</div>
              <div className="bg-white px-3 py-1 rounded text-black text-xs font-semibold">STRIPE</div>
            </div>
            
            <h4 className="font-semibold mb-3 mt-4 text-yellow-400">FEATURED BRANDS</h4>
            <div className="flex flex-wrap gap-3">
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">APPLE</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">TECNO</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">SAMSUNG</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">MI</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">OPPO</div>
            </div>
          </div>
        </div>
      </div>

      {/* UK2Naija CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join 5,000+ Smart Nigerian Buyers
          </h3>
          <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto">
            Never buy fake "London-used" again — shop genuine UK stock only.
          </p>
          <a
            href="#products-section"
            onClick={(e) => {
              e.preventDefault();
              const productsSection = document.getElementById('products-section');
              productsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Shop UK Deals Today
          </a>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-slate-950 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {year} {name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}