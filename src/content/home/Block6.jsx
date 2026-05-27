import { Block6Datas } from "@/constant/Home/Block6Data";
import Image from "next/image";
import Link from "next/link";

const Block6 = () => {
    return (
      <div className="w-full flex flex-col px-10">
        <div className="py-8 w-full">
          <h1 className="sm:text-[25px] text-[20px] font-bold text-black">ELEVATE YOUR STYLE</h1>
        </div>
        <div className="w-full flex gap-5 items-center overflow-x-auto md:overflow-x-hidden justify-start">
          {Block6Datas.map((item, index) => (
            <Link
              href={item.href} 
              key={index} 
              className="relative w-[60%] sm:w-[45%] md:w-[32%] lg:w-[33%] flex-shrink-0 cursor-pointer"
            >
              <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[650px]">
                <Image
                  className="w-full h-full object-cover"
                  src={item.img}
                  alt="Puma Images"
                  width={500}
                  height={500}
                />
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-end justify-center z-10">
                  <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-black to-transparent" />
                  <div className="relative text-white lg:text-2xl md:text-lg text-[25px]  font-semibold p-4">{item.name}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
};

export default Block6;
