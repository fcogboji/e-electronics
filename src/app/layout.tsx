import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
//import CarouselWrapper from '@/components/CarouselWrapper';
import ToasterProvider from '@/components/ToasterProvider';
import ElectroShopBanner from '@/components/ElectroShopBanner';
import LiveChatWidget from '@/components/LiveChatWidget';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '🇬🇧 UK2Naija Gadgets',
  description: 'Premium UK-Used Phones & Laptops, Delivered to Your Door in Nigeria',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // During build time, provide placeholder key
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="min-h-screen flex flex-col">
        <ClerkProvider publishableKey={publishableKey}>
          <ToasterProvider />
          {/* <ElectroShopBanner /> */}
          <Navbar />
          {/* <CarouselWrapper /> */}
          <main className="flex-grow pt-24 sm:pt-20">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <LiveChatWidget />
        </ClerkProvider>
      </body>
    </html>
  );
}
