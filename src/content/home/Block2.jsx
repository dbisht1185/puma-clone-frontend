import DescriptionB2 from "@/components/Home/longCardB2/descriptionB2";
import Link from "next/link";

const Block2 = () => {
  return (
    <>
      <Link
        href="/products/footwear"
        className="
         w-full min-h-[500px] sm:h-[550px]
          bg-no-repeat
          flex flex-col gap-5 justify-center
          cursor-pointer
          bg-[url('/Images/Home/Block2/mobile_Size6c88a79973162367fec53b4a9a0e2b55e015dff4.avif')]
          sm:bg-[url('/Images/Home/Block2/d68e8c58e7bcdeb121a389db543ebd052336edac.jpeg')]
          bg-contain sm:bg-cover px-5 sm:px-12
        "
      >
        <div className="hidden sm:block">
          <h1 className="text-[40px] font-bold text-white">WELCOME TO DREAMLAND </h1> 
          <div className="text-white flex">
            <div className="text-[25px]">PUMA x AC MILAN x OFF-WHITE</div>
            <div className="text-[14px] mt-[4px]">TM</div>
          </div>
          <h3 className="text-white">LIMITED EDITION</h3>
        </div>
        <div className="hidden sm:block">
          <button className="px-3 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-[2px] cursor-pointer">
            SHOP NOW
          </button>
        </div>
      </Link>

      <div className="block sm:hidden w-full">
        <DescriptionB2 />
      </div>
    </>
  );
};

export default Block2;
