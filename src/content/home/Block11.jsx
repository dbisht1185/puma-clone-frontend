"use client";

import { useEffect, useState } from "react";
import Swipers from "@/components/Home/Swiper/Swipers";
import { RecentlyViewedDatas } from "@/constant/Home/RecentlyViewedData";

const Block11 = () => {
  const [viewedItems, setViewedItems] = useState(RecentlyViewedDatas);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (list && list.length > 0) {
            setViewedItems(list);
          }
        } catch (e) {
          console.error("Failed to parse recently viewed items", e);
        }
      }
    }
  }, []);

  return (
    <div className="w-full px-5">
      <div className="text-black flex">
        <div className="text-[25px] font-bold">RECENTLY VIEWED BY YOU</div>
      </div>
      <div className="container mx-auto py-6">
        <Swipers data={viewedItems} />
      </div>
    </div>
  );
};

export default Block11;
