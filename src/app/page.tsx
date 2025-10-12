export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
//import BrandCarousel from "@/components/BrandCarousel";
import LivePromotionsCarousel from '@/components/LivePromotionsCarousel';
import TrendingCarousel from '@/components/TrendingCarousel';
import LaptopsCarousel from '@/components/LaptopsCarousel';
import ProductCategories from '@/components/ProductCategories';
import FlashSalesSection from '@/components/FlashSalesSection';
import HowItWorks from '@/components/HowItWorks';
import CustomerTestimonials from '@/components/CustomerTestimonials';

export default async function HomePage() {
  const products = await prisma.product.findMany();

  // Get products for each carousel type
  const livePromoProducts = products
    .filter(p => p.isLivePromo)
    .map(product => ({
      ...product,
      discount: product.discount ?? 0,
    }));

  const featuredProducts = products
    .filter(p => p.isFeatured)
    .map(product => ({
      ...product,
      discount: product.discount ?? 0,
    }));

  const laptopProducts = products
    .filter(p => p.isLaptop)
    .map(product => ({
      ...product,
      discount: product.discount ?? 0,
    }));

  // Get all products for the main grid
  const allProducts = products.map(product => ({
    ...product,
    discount: product.discount ?? 0,
  }));

  return (
    <>
      <HeroSection />

      {/* <BrandCarousel /> */}

      <HowItWorks />

      <FlashSalesSection />

      {livePromoProducts.length > 0 && (
        <LivePromotionsCarousel products={livePromoProducts} />
      )}

      {featuredProducts.length > 0 && (
        <TrendingCarousel products={featuredProducts} />
      )}

      {laptopProducts.length > 0 && (
        <LaptopsCarousel products={laptopProducts} />
      )}

      <ProductCategories />

      <div id="products-section">
        <ProductGrid
          products={allProducts}
          title="All Products"
          subtitle="Shop Now"
        />
      </div>

      <CustomerTestimonials />
    </>
  );
}
