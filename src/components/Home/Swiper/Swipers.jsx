"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar,Mousewheel } from "swiper/modules";
import React from "react";
import Link from "next/link";

import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/navigation";
import "swiper/css/mousewheel";
import { HotWeelsDatas } from "@/constant/Home/Block9Data";

const Swipers = ({ data = HotWeelsDatas }) => {
  return (
    <div className="relative px-2">
      <Swiper
        spaceBetween={20}
        navigation={true}
        mousewheel={{ forceToAxis: true }}
        className="!mySwiper !static sm:h-[65vh] md:h-[50vh] lg:h-[60vh] md:min-h-[400px] z-[-20] h-[40vh] "
        scrollbar={{ draggable: true }}
        modules={[Scrollbar, Navigation,Mousewheel]}
        breakpoints={{
          320: { slidesPerView: 2.2 }, // Extra small screens
          480: { slidesPerView: 2.2 }, // Small screens
          640: { slidesPerView: 3.2 }, // Medium screens
          768: { slidesPerView: 3.5 }, // Tablets
          1024: { slidesPerView: 4.2 }, // Laptops
        }}
      >
        {data.map((item, index) => {
          // Generate a slug from the product name
          const slug = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          return (
            <SwiperSlide key={index}>
              <Link href={`/productdetails/${slug}`} className="text-center flex flex-col gap-4 w-full max-w-xs mx-auto cursor-pointer">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-auto object-cover"
                />
                <div className="flex justify-between w-full text-left px-2">
                  <h1 className="text-sm font-bold">{item.name}</h1>
                  <div className="flex flex-col items-end">
                    {item.offerPrice ? (
                      <>
                        <h2 className="text-sm font-bold text-red-600">{item.offerPrice}</h2>
                        <h2 className="text-xs font-normal text-gray-500 line-through">{item.price}</h2>
                      </>
                    ) : (
                      <h2 className="text-sm font-bold">{item.price}</h2>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom styles for navigation & scrollbar */}
      <style jsx>{`
        :global(.swiper-button-prev),
        :global(.swiper-button-next) {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgb(223, 224, 225);
          border-radius: 50%;
          transition: all 0.3s ease-in-out;
        }

        :global(.swiper-button-prev) {
          left: -10px !important;
        }

        :global(.swiper-button-next) {
          right: -20px !important;
        }

        :global(.swiper-button-prev::after),
        :global(.swiper-button-next::after) {
          font-size: 13px;
          font-weight: bold;
          color: black;
        }

        :global(.swiper-button-prev:hover),
        :global(.swiper-button-next:hover) {
          background-color: rgb(200, 200, 200);
        }

        :global(.swiper-scrollbar) {
          height: 6px !important;
          background: #e0e0e0;
          border-radius: 5px;
          bottom: 10px !important;
        }

        :global(.swiper-scrollbar-drag) {
          height: 100%;
          background: #333;
          border-radius: 5px;
        }
          :global(.swiper-button-prev.swiper-button-disabled), 
          :global(.swiper-button-next.swiper-button-disabled) {
    opacity: 0;
    cursor: auto;
    pointer-events: none;
}
         /* Hide navigation on small screens */
        @media (max-width: 768px) {
          :global(.swiper-button-prev),
          :global(.swiper-button-next) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Swipers;
