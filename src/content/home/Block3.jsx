import DescriptionB3 from "@/components/Home/longCardB3/descriptionB3";
import Link from "next/link";

const Block3 = () => {
  return (
    <>
      <Link
        href="/products/footwear"
        className="
          w-full min-h-[500px] sm:h-[550px]
          bg-no-repeat bg-center
          flex flex-col gap-5 justify-center
          px-0 sm:px-16
          cursor-pointer
          bg-[url('/Images/Home/Block3/Mobile_Size_e8dbbe697ef344fe643d8d80c301e0a8d1cc8e3f.avif')]
          sm:bg-[url('/Images/Home/Block3/f571697198c0088cf47433371305eac19fe134ae.jpeg')]
          bg-contain sm:bg-cover
        "
      >
        <div className="hidden sm:block">
          <h1 className="text-[40px] font-bold text-white">PUMA x TMNT</h1>
          <h2 className="text-[24px] text-white">UP FROM THE UNDERGROUND</h2>
        </div>
        <div className="hidden sm:block">
          <button className="px-3 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-[2px] cursor-pointer">
            SHOP NOW
          </button>
        </div>
      </Link>

      <div className="block sm:hidden w-full">
        <DescriptionB3 />
      </div>
    </>
  );
};

export default Block3;
