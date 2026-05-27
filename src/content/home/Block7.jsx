import Link from "next/link";

const Block7 = () => {
    return (
      <>
        <Link
          href="/products/apparel"
          className="w-full bg-no-repeat min-h-[500px] sm:h-[550px] flex flex-col items-start md:items-start justify-center gap-5 
          bg-[url('https://cdn.sanity.io/images/qa41whrn/prod/88a8686a9ad951e55843b5ee25ba1f8b34ba0946-1200x1200.jpg')] 
          sm:bg-[url('https://cdn.sanity.io/images/qa41whrn/prod/ce10fb20476d9294d37c2b05e515b3f767145b40-6000x2167.jpg')] 
          bg-cover px-6 sm:px-12 md:px-16 lg:px-20 mt-10 cursor-pointer"
        >
          <div className="hidden md:flex flex-col md:items-start items-center text-center md:text-left">
            <h1 className="text-[30px] md:text-[35px] font-bold text-white">
              READY. SET. GO.
            </h1>
            <h2 className="text-[18px] md:text-[22px] text-white">
              PUMA ARCHIVE SEASONAL RACER JACKET
            </h2>
            <h3 className="text-[14px] md:text-[16px] text-white">
              WORN BY DUA LIPA
            </h3>
          </div>
          <button className="hidden md:block px-4 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-md cursor-pointer">
            SHOP NOW
          </button>
        </Link>
        <Link href="/products/apparel" className="md:hidden w-full flex flex-col items-center justify-center gap-2 mb-5 text-center cursor-pointer">
          <h1 className="text-[20px] font-bold text-black">READY. SET. GO.</h1>
          <h2 className="text-[16px] text-black">PUMA ARCHIVE SEASONAL RACER JACKET</h2>
          <button className="px-4 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-md cursor-pointer">
            SHOP NOW
          </button>
        </Link>
      </>
    );
  };
  
  export default Block7;
  