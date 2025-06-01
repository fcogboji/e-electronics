"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import Link from "next/link";

const brands = [
  {
    image: "/images/samsung.jpg",
    alt: "Samsung",
    href: "/product-category/brands/samsung",
  },
  {
    image: "/images/royal.jpg",
    alt: "Royal",
    href: "/product-category/brands/royal",
  },
  {
    image: "/images/lg.png",
    alt: "LG",
    href: "/product-category/brands/lg",
  },
  {
    image: "/images/panasonic.jpeg",
    alt: "Panasonic",
    href: "/product-category/brands/panasonic",
  },
  {
    image: "/images/apple.jpeg",
    alt: "Apple",
    href: "/product-category/brands/apple",
  },
];

export default function BrandCarousel() {
  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <hr className="border-gray-300" />
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={true}
        speed={500}
        slidesPerView={4}
        slidesPerGroup={1}
        centeredSlides={false}
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {brands.map((brand, index) => (
          <SwiperSlide key={index} className="flex justify-center pl-9">
            <Link href={brand.href}>
              <Image
                src={brand.image}
                alt={brand.alt}
                width={150}
                height={80}
                className="object-contain cursor-pointer"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <hr className="border-gray-300" />
    </div>
  );
}
