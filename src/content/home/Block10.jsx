"use client";

import Swipers from "@/components/Home/Swiper/Swipers";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/mocks/products";
import { TopTrendingDatas } from "@/constant/Home/TopTrendingData";

const Block10 = () => {
  const { data: productsRes } = useQuery({
    queryKey: ["homepageTrending"],
    queryFn: () => productsApi.getProducts({ trending: "true" }),
  });

  // Dynamic fallback: Use database trending products if available, else use premium static placeholders!
  const trendingProducts =
    productsRes?.data?.status === "SUCCESS" && productsRes?.data?.data?.length > 0
      ? productsRes.data.data.map(p => ({
          name: p.name,
          img: p.img,
          price: p.price,
          offerPrice: p.offerPrice
        }))
      : TopTrendingDatas;

  return (
    <div className="w-full px-5">
      <div className="text-black flex">
        <div className="text-[25px] font-bold">TOP TRENDING</div>
      </div>
      <div className="container mx-auto py-6">
        <Swipers data={trendingProducts} />
      </div>
    </div>
  );
};

export default Block10;
