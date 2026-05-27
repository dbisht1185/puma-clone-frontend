import { Block1Datas } from "@/constant/Home/Block1Data";
import Image from "next/image";
import Link from "next/link";

const Block1 = () => {
  return (
    <div className="w-full px-5 py-2 md:py-5 md:my-10">
      <div className="flex lg:grid lg:grid-cols-4 gap-5 overflow-x-auto lg:overflow-visible scroll-smooth snap-x snap-mandatory no-scrollbar">
        {Block1Datas.map((item, index) => {
          // Generate a slug from the product name
          const slug = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          return (
            <Link
              key={index}
              href={`/productdetails/${slug}`}
              className="flex flex-col min-w-[43%] sm:min-w-[60%] md:min-w-[45%] lg:w-full snap-start cursor-pointer"
            >
            <div className="w-full mb-3">
              <Image
                src={item.img}
                alt={item.name}
                width={400}
                height={400}
                className="object-cover w-full h-auto rounded-lg"
              />
            </div>
            <div className="flex flex-col lg:flex-row justify-between my-2">
              {/* Name */}
              <p className="font-semibold lg:text-[16px] text-[13px] lg:w-2/3">{item.name}</p>
              {/* Price */}
              <p className="font-semibold lg:text-[16px] text-[14px] lg:w-1/3 lg:mt-0 mt-2">{item.price}</p>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Block1;
