"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  LogIn,
  User,
  ListOrdered,
  Heart,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CreditCard,
  RefreshCcw,
  PackageCheck,
  Truck,
  CircleSlash,
  Search,
  Menu,
  X,
  LayoutDashboard,
  PlusCircle,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";

  const items = useCartStore((state) => state.items);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const [openDropdown, setOpenDropdown] = useState<"account" | "help" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (menu: "account" | "help") => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  const sidebarLinks = [
    "Appliances",
    "Phones & Tablets",
    "Health & Beauty",
    "Home & Office",
    "Electronics",
    "Fashion",
    "Supermarket",
    "Computing",
    "Baby Products",
    "Gaming",
    "Musical Instruments",
    "Other categories",
  ];

  // Popular brands for suggestions
  const popularBrands = [
    "Apple", "Samsung", "Sony", "LG", "Nike", "Adidas", "HP", "Dell", 
    "Canon", "Nikon", "Microsoft", "Google", "Amazon", "Philips", "Panasonic"
  ];

  // Filter suggestions based on search query
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const categorySuggestions = sidebarLinks
      .filter(category => category.toLowerCase().includes(query))
      .map(category => ({ type: 'category', value: category }));
    
    const brandSuggestions = popularBrands
      .filter(brand => brand.toLowerCase().includes(query))
      .map(brand => ({ type: 'brand', value: brand }));
    
    return [...categorySuggestions, ...brandSuggestions].slice(0, 8);
  };

  const suggestions = getSearchSuggestions();

  // Handle search submission
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Check if it's a category
    const matchedCategory = sidebarLinks.find(
      category => category.toLowerCase() === query.toLowerCase()
    );
    
    if (matchedCategory) {
      // Navigate to category page
      router.push(`/product-category/${matchedCategory.toLowerCase().replace(/ & | /g, "-")}`);
    } else {
      // Navigate to search results page with query (for brands or general search)
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    
    setSearchQuery("");
    setShowSearchSuggestions(false);
    searchInputRef.current?.blur();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { type: string; value: string }) => {
    setSearchQuery(suggestion.value);
    setShowSearchSuggestions(false);
    handleSearch(suggestion.value);
  };

  // Handle input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchSuggestions(value.trim().length > 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    } else if (e.key === "Escape") {
      setShowSearchSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-4/5 max-w-sm bg-white shadow-lg z-50 transition-transform duration-300 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <ul className="p-4 space-y-2">
          {sidebarLinks.map((item) => (
            <li key={item}>
              <Link
                href={`/product-category/${item.toLowerCase().replace(/ & | /g, "-")}`}
                onClick={() => setSidebarOpen(false)}
                className="block px-3 py-3 hover:bg-gray-100 rounded text-base"
              >
                {item}
              </Link>
            </li>
          ))}

          <hr className="my-3" />

          <li>
            <Link href="/sign-in" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Sign In
            </Link>
          </li>
          <li>
            <Link href="/account" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              My Account
            </Link>
          </li>
          <li>
            <Link href="/orders" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Orders
            </Link>
          </li>
          <li>
            <Link href="/wishlist" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Wishlist
            </Link>
          </li>

          {isAdmin && (
            <>
              <hr className="my-3" />
              <li>
                <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
                  <LayoutDashboard className="inline mr-2" size={16} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/new" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
                  <PlusCircle className="inline mr-2" size={16} />
                  Add Product
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
                  <PlusCircle className="inline mr-2" size={16} />
                  Admin Orders
                </Link>
              </li>
            </>
          )}

          <hr className="my-3" />

          {/* 🔍 Track Order by ID input */}
          <li>
            <div className="px-2">
              <input
                type="text"
                placeholder="Enter Order ID"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const orderId = (e.target as HTMLInputElement).value.trim();
                    if (orderId) {
                      window.location.href = `/orders/${orderId}`;
                      setSidebarOpen(false);
                    }
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter to track order</p>
            </div>
          </li>

          <li>
            <Link href="/help-center" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Help Center
            </Link>
          </li>
          <li>
            <Link href="/place-order" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Place an order
            </Link>
          </li>
          <li>
            <Link href="/payment-options" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Payment options
            </Link>
          </li>
          <li>
            <Link href="/track-order" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Track an order
            </Link>
          </li>
          <li>
            <Link href="/cancel-order" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Cancel an order
            </Link>
          </li>
          <li>
            <Link href="/returns-refunds" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Returns & Refunds
            </Link>
          </li>
          <li>
            <Link href="/live-chat" onClick={() => setSidebarOpen(false)} className="block px-2 py-1 hover:bg-gray-100 rounded">
              Live Chat
            </Link>
          </li>
        </ul>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          {/* Left: Hamburger and Logo */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="block text-gray-900 hover:text-gray-700 p-1 flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
            </button>
            <Link href="/" className="flex items-center min-w-0">
              <span className="font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-blue-500 via-green-600 to-red-500 bg-clip-text text-transparent whitespace-nowrap">
                UK2Naija Gadget
              </span>
            </Link>
          </div>

          {/* Center: Search with Suggestions - Desktop Only */}
          <div className="flex-grow max-w-2xl mx-2 sm:mx-4 relative hidden md:block" ref={searchContainerRef}>
            <div className="flex items-center bg-white border-2 border-gray-300 px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
              <Search className="text-gray-600 mr-2 flex-shrink-0" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.trim() && setShowSearchSuggestions(true)}
                placeholder="Search by category or brand name..."
                className="w-full bg-transparent focus:outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchSuggestions(false);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                  >
                    <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                      suggestion.type === 'category'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {suggestion.type === 'category' ? 'Category' : 'Brand'}
                    </span>
                    <span className="text-sm truncate">{suggestion.value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: User + Cart */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <SignedOut>
              <Link href="/sign-in" className="hidden sm:block text-sm sm:text-base lg:text-lg font-bold text-gray-900 hover:text-gray-700 whitespace-nowrap">
                Sign In
              </Link>
              <Link href="/sign-in" className="sm:hidden p-1" aria-label="Sign in">
                <LogIn size={20} strokeWidth={2} className="text-gray-900" />
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="scale-100 sm:scale-110 md:scale-125">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <Link href="/cart" className="relative text-gray-900 hover:text-gray-700 inline-block" aria-label="Shopping cart">
              <div className="relative p-1.5 sm:p-2">
                <ShoppingBag size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-0.5 -right-0.6 sm:-top-1 sm:-right-1 bg-red-600 text-white text-[10px] sm:text-xs leading-none min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] rounded-full flex items-center justify-center font-bold border-[1.5px] sm:border-2 border-white shadow-sm">
                    {totalQuantity > 99 ? '99+' : totalQuantity}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-2 sm:px-4 pb-2 sm:pb-3 relative">
          <div className="flex items-center bg-white border-2 border-gray-300 px-3 py-2 rounded-full shadow-md">
            <Search className="text-gray-600 mr-2 flex-shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.trim() && setShowSearchSuggestions(true)}
              placeholder="Search..."
              className="w-full bg-transparent focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchSuggestions(false);
                }}
                className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Search Suggestions Dropdown */}
          {showSearchSuggestions && suggestions.length > 0 && (
            <div className="absolute left-2 right-2 sm:left-4 sm:right-4 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-64 overflow-y-auto z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                >
                  <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                    suggestion.type === 'category'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.type === 'category' ? 'Cat' : 'Brand'}
                  </span>
                  <span className="text-sm truncate">{suggestion.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}