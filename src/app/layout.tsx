import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarouselWrapper from '@/components/CarouselWrapper';
import ElectroShopBanner from '@/components/ElectroShopBanner';
import ClientProviders from '@/components/ClientProviders';
import './globals.css';

export const metadata = {
  title: 'ElectroShop',
  description: 'Buy electronics and phone accessories online',
};

function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <ElectroShopBanner />
      <Navbar />
      <CarouselWrapper />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </ClientProviders>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
