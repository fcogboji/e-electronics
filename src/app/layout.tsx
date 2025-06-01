import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarouselWrapper from '@/components/CarouselWrapper';
import ToasterProvider from '@/components/ToasterProvider'; // ✅ Import this
import './globals.css';

export const metadata = {
  title: 'ElectroShop',
  description: 'Buy electronics and phone accessories online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ClerkProvider>
          <ToasterProvider /> {/* ✅ Only this is client-side */}
          <Navbar />
          <CarouselWrapper />
          <main className="flex-grow pt-20">{children}</main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
