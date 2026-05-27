import Link from "next/link";

const Block4 = () => {
  return (
    <>
      <div className="w-full flex flex-col gap-5 mt-5">
        <div className="md:px-8 px-4">
          <h1 className="md:text-[21px] text-[15px] md:font-bold font-semibold text-black">
            MAKE WAY FOR YOUR NEW DRIP
          </h1>
        </div>

        <Link
          href="/products/apparel"
          className="w-full bg-no-repeat min-h-[500px] sm:h-[550px] flex flex-col items-end justify-center gap-5 
          bg-[url('https://cdn.sanity.io/images/qa41whrn/prod/5453448a66a6bda95f2cd2ff76fd0745f5016cba-1536x1536.jpg')] 
          sm:bg-[url('https://cdn.sanity.io/images/qa41whrn/prod/0b15efe23e427c00a44ef942d7bc7379799d2b07-6000x2167.jpg')] 
          bg-cover px-6 sm:px-12 md:px-16 lg:px-20 cursor-pointer"
        >
          <div className="hidden md:flex flex-col md:items-end items-center text-center md:text-right">
            <h1 className="text-[30px] md:text-[35px] font-bold text-white">
              WELCOME TO THE CREW
            </h1>
            <h2 className="text-[18px] md:text-[22px] text-white">
              SCUDERIA FERRARI HP REPLICA COLLECTION
            </h2>
          </div>
          <button className="hidden md:block px-3 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-[2px] cursor-pointer">
            SHOP NOW
          </button>
        </Link>
      </div>

      <Link href="/products/apparel" className="md:hidden w-full flex flex-col items-center justify-center my-5 gap-5 py-5 cursor-pointer">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-[20px] font-bold text-black">WELCOME TO THE CREW</h1>
          <h2 className="text-[16px] text-black">SCUDERIA FERRARI HP REPLICA COLLECTION</h2>
        </div>
        <button className="block md:hidden px-3 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-[2px] cursor-pointer">
          SHOP NOW
        </button>
      </Link>
    </>
  );
};

export default Block4;
