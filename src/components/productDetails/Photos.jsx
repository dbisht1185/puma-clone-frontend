import { PhotoScrollDatas } from "@/constant/ProductsDerails/PhotoScroll";
import Image from "next/image";
import React from "react";

const Photos = React.forwardRef(({ images }, ref) => {
  const photosArray = images && images.length > 0 ? images : PhotoScrollDatas.map(p => p.img);
  return (
    <div ref={ref} className="w-full">
      <div className="w-full grid grid-cols-2 gap-5">
        {photosArray.map((img, idx) => {
          const isExternal = typeof img === 'string' && img.startsWith('http');
          return (
            <div key={idx} className="w-full">
              <Image
                src={img}
                alt="Shoes Images"
                width={600}
                height={600}
                className="w-full h-auto object-cover"
                unoptimized={isExternal}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

Photos.displayName = "Photos";

export default Photos;