import Link from "next/link";

const DescriptionB3 = () => {
  return (
    <Link href="/products/footwear" className='w-full h-auto flex flex-col gap-5 justify-center px-5 items-center py-2 pb-5 cursor-pointer'>
      <div className="flex flex-col items-center">
        <h1 className="text-[25px] font-bold text-black">PUMA x TMNT</h1>
        <h2 className="text-[14px] text-black">UP FROM THE UNDERGROUND</h2>
      </div>
      <div>
        <button className="px-3 py-2 font-semibold rounded-[2px] cursor-pointer ">
          SHOP NOW
        </button>
      </div>
    </Link>
  );
};

export default DescriptionB3;
