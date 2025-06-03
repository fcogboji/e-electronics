
'use client';
import Link from 'next/link';

import { useState } from 'react';

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
            <h3 className="text-xl font-semibold mb-4">New to ElectroShop?</h3>
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
                  <span>I agree to ElectroShop's Privacy and Cookie Policy. You can unsubscribe from newsletters at any time.</span>
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
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">DOWNLOAD ELECTROSHOP FREE APP</h3>
            <p className="text-gray-300 mb-4">Get access to exclusive offers!</p>
            <div className="space-y-3">
              <a href="#" className="block">
                <img src="https://via.placeholder.com/150x50/000000/FFFFFF?text=App+Store" alt="Download on App Store" className="h-12" />
              </a>
              <a href="#" className="block">
                <img src="https://via.placeholder.com/150x50/000000/FFFFFF?text=Google+Play" alt="Get it on Google Play" className="h-12" />
              </a>
            </div>
          </div>

          {/* Need Help Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Need Help?</h3>
            <div className="mb-4">
              <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                Chat with us
              </button>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/help" className="hover:text-yellow-400 transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-yellow-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Useful Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/service-center" className="hover:text-yellow-400 transition-colors">Service Center</a></li>
              <li><a href="/how-to-shop" className="hover:text-yellow-400 transition-colors">How to shop on ElectroShop?</a></li>
              <li><a href="/delivery" className="hover:text-yellow-400 transition-colors">Delivery options and timelines</a></li>
              <li><a href="/returns" className="hover:text-yellow-400 transition-colors">How to return a product?</a></li>
              <li><a href="/bulk-purchases" className="hover:text-yellow-400 transition-colors">Corporate and bulk purchases</a></li>
              <li><a href="/report-product" className="hover:text-yellow-400 transition-colors">Report a Product</a></li>
              <li><a href="/dispute-resolution" className="hover:text-yellow-400 transition-colors">Dispute Resolution Policy</a></li>
              <li><a href="/return-policy" className="hover:text-yellow-400 transition-colors">Return Policy</a></li>
              <li><a href="/pickup-stations" className="hover:text-yellow-400 transition-colors">Pickup Stations</a></li>
            </ul>
          </div>

          {/* About ElectroShop */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">ABOUT ELECTROSHOP</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link href="/about" className="hover:text-yellow-400 transition-colors">About us</Link></li>
              <li><Link href="/careers" className="hover:text-yellow-400 transition-colors">ElectroShop careers</Link></li>
              <li><Link href="/express" className="hover:text-yellow-400 transition-colors">ElectroShop Express</Link></li>
              <li><Link href="/terms" className="hover:text-yellow-400 transition-colors">Terms and Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Notice</Link></li>
              <li><Link href="/store-credit" className="hover:text-yellow-400 transition-colors">Store Credit Terms</Link></li>
              <li><Link href="/payment-info" className="hover:text-yellow-400 transition-colors">Payment Information Guidelines</Link></li>
              <li><Link href="/cookies" className="hover:text-yellow-400 transition-colors">Cookie Notice</Link></li>
              <li><Link href="/official-stores" className="hover:text-yellow-400 transition-colors">Official Stores</Link></li>
              <li><Link href="/flash-sales" className="hover:text-yellow-400 transition-colors">Flash Sales</Link></li>
            </ul>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-700">
          
          {/* Make Money */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">MAKE MONEY WITH ELECTROSHOP</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/sell" className="hover:text-yellow-400 transition-colors">Sell on ElectroShop</Link></li>
              <li><Link href="/vendor-hub" className="hover:text-yellow-400 transition-colors">Vendor hub</Link></li>
              <li><Link href="/sales-consultant" className="hover:text-yellow-400 transition-colors">Become a Sales Consultant</Link></li>
              <li><Link href="/blog" className="hover:text-yellow-400 transition-colors">Our Blog</Link></li>
            </ul>
          </div>

          {/* International */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">ELECTROSHOP INTERNATIONAL</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-300 text-sm">
              <Link href="/ng" className="hover:text-yellow-400 transition-colors">Nigeria</Link>
              <Link href="/ke" className="hover:text-yellow-400 transition-colors">Kenya</Link>
              <Link href="/eg" className="hover:text-yellow-400 transition-colors">Egypt</Link>
              <Link href="/gh" className="hover:text-yellow-400 transition-colors">Ghana</Link>
              <Link href="/ma" className="hover:text-yellow-400 transition-colors">Morocco</Link>
              <Link href="/ci" className="hover:text-yellow-400 transition-colors">Ivory Coast</Link>
              <Link href="/sn" className="hover:text-yellow-400 transition-colors">Senegal</Link>
              <Link href="/ug" className="hover:text-yellow-400 transition-colors">Uganda</Link>
            </div>
          </div>

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
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">ADIDAS</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">NIKE</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">SAMSUNG</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">APPLE</div>
              <div className="bg-gray-700 px-3 py-1 rounded text-xs font-semibold">SONY</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-slate-950 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2025 ElectroShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}