"use client";

import Swipers from "@/components/Home/Swiper/Swipers";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/mocks/products";
import { HotWeelsDatas } from "@/constant/Home/Block9Data";

const Block9 = () => {
  const { data: productsRes } = useQuery({
    queryKey: ["homepageCollaborations", "Hot Wheels"],
    queryFn: () => productsApi.getProducts({ collaborationName: "Hot Wheels" }),
  });

  // Dynamic fallback: Use database products if available, else use premium static placeholders!
  const collaborationProducts =
    productsRes?.data?.status === "SUCCESS" && productsRes?.data?.data?.length > 0
      ? productsRes.data.data.map(p => ({
          name: p.name,
          img: p.img,
          price: p.price,
          offerPrice: p.offerPrice
        }))
      : HotWeelsDatas;

  return (
    <div className="w-full px-5">
      <div className="text-black flex">
        <div className="text-[25px] font-bold">PUMA x HOT WHEELS</div>
        <div className="font-semibold text-[12px] mt-[4px]">TM</div>
      </div>
      <div className="container mx-auto py-6">
        <Swipers data={collaborationProducts} />
      </div>
    </div>
  );
};

export default Block9;
