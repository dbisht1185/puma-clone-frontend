"use client";

import SideBar from "@/components/Account/SideBar";
import Swipers from "@/components/Home/Swiper/Swipers";
import Cards from "@/components/Products/Cards";
import { cardDatas } from "@/constant/Accounts/card";
import { TopTrendingDatas } from "@/constant/Home/TopTrendingData";
import { RecentlyViewedDatas } from "@/constant/Home/RecentlyViewedData";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/mocks/auth";
import { productsApi } from "@/mocks/products";

const Page = () => {
  // Fetch real-time user profile from MongoDB
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.data?.status === "SUCCESS" ? res.data.data : null;
    }
  });

  // Fetch dynamic Top Trending products from MongoDB
  const { data: trendingRes } = useQuery({
    queryKey: ["homepageTrending"],
    queryFn: () => productsApi.getProducts({ trending: "true" }),
  });

  // Dynamic Top Trending items fallback
  const trendingProducts =
    trendingRes?.data?.status === "SUCCESS" && trendingRes?.data?.data?.length > 0
      ? trendingRes.data.data.map(p => ({
          name: p.name,
          img: p.img,
          price: p.price,
          offerPrice: p.offerPrice
        }))
      : TopTrendingDatas;

  // State to hold dynamic localStorage recently viewed items
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (list && list.length > 0) {
            setRecentlyViewed(list);
          } else {
            setRecentlyViewed(RecentlyViewedDatas);
          }
        } catch (e) {
          console.error("Failed to parse recently viewed items", e);
          setRecentlyViewed(RecentlyViewedDatas);
        }
      } else {
        setRecentlyViewed(RecentlyViewedDatas);
      }
    }
  }, []);

  const userName = userProfile?.name || (typeof window !== "undefined" ? localStorage.getItem("userName") : "") || "Valued Customer";

  return (
    <div className="w-full flex h-full ">
      <SideBar/>
      <div className="hidden lg:block w-[80%] p-10 h-full">
        <div className="h-full flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <div className="text-4xl font-bold">Hello, {userName}</div>
            <div className="text-lg font-normal">Account Overview</div>
          </div>
          <div className="w-full flex gap-10">
            {cardDatas.map((items, index) => (
              <div
                key={index}
                className="min-w-[300px] h-[220px] bg-cover bg-center flex items-end justify-center py-5"
                style={{ backgroundImage: `url(${items.bg})` }}>
                <div className="flex items-end justify-center px-5 py-2 bg-[#181818] hover:bg-[#464646] cursor-pointer text-white text-[16px] font-bold">{items.title}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <div className="text-2xl font-bold">TOP TRENDING</div>
            <div>
              <Swipers data={trendingProducts}/>
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold">RECENTLY VIEWED BY YOU</div>
            <div>
              <Cards filteredProducts={recentlyViewed.map(item => ({
                productId: item.productId || item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                name: item.name,
                price: item.price,
                offerPrice: item.offerPrice,
                img: item.img,
                basePrice: parseFloat(item.price.replace(/[₹,\s]/g, "")) || 0,
                discountType: item.offerPrice ? "PERCENT" : null,
                discountValue: item.offerPrice ? 20 : 0,
                stock: 10
              }))}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
