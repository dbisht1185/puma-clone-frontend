import Link from "next/link";

const DescriptionB2 = () => {
  return (
    <Link 
    href="/products/footwear"
    className="w-full h-auto flex flex-col gap-5 justify-center px-5 items-center cursor-pointer" 
  >
  <div className="flex flex-col items-center w-full">
      <h1 className=" text-[20px] font-bold text-black">WELCOME TO DREAMLAND</h1>
      <div className=" text-black flex"><div className=" text-[14px]">PUMA x AC MILAN x OFF-WHITE</div><div className="text-[9px] mt-[1px]">TM</div></div>
      <h3 className="text-[13px] text-black">LIMITED EDITION</h3>
  </div>
  <div>
      <button className="px-3 py-2 font-semibold rounded-[2px] cursor-pointer ">SHOP NOW</button>
  </div>
  </Link>
  )
}

export default DescriptionB2