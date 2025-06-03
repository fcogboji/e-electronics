"use client";

import Link from "next/link";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
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
import { useState } from "react";

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";

  const items = useCartStore((state) => state.items);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const [openDropdown, setOpenDropdown] = useState<"account" | "help" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-3/4 max-w-sm bg-white shadow-lg z-50 transition-transform duration-300 overflow-y-auto ${
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
                className="block px-2 py-1 hover:bg-gray-100 rounded"
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
            </>
          )}

          <hr className="my-3" />
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
      <nav className="flex items-center justify-between px-4 py-3 bg-red-200 shadow-md z-40 relative">
        {/* Left: Hamburger and Logo */}
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => setSidebarOpen(true)} className="block">
            <Menu size={24} />
          </button>
          <Link href="/" className="text-lg font-bold">
            ElectroShop
          </Link>
        </div>

        {/* Center: Search (always visible) */}
        <div className="flex-grow max-w-lg mx-2">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
            <Search className="text-gray-600 mr-2" size={20} />
            <input
              type="text"
              placeholder="Search products by brand and categories"
              className="w-full bg-transparent focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Right: Account and Cart */}
        <div className="flex items-center gap-3 w-1/3 justify-end">
          <SignedOut>
            <Link href="/sign-in" className="text-sm">
              Sign In
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <Link href="/cart" className="relative">
            <ShoppingBag className="w-6 h-6" />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </>
  );
}
