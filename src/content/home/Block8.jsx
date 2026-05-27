import Link from "next/link";

const Block8 = () => {
    return (
      <>
        <Link
          href="/products/apparel"
          className="w-full bg-no-repeat min-h-[500px] sm:h-[550px] flex flex-col items-center md:items-end justify-center gap-5 
          bg-[url('https://cdn.sanity.io/images/qa41whrn/prod/690f97fbb347df123aca821d6bb03dd7a863f649-3200x3200.jpg')] 
          sm:bg-[url('https://cdn.sanity.io/images/qa41whrn/prod/3072a2dc54f9091720b06918270483fe383dfd40-6000x2167.jpg')] 
          bg-cover px-6 sm:px-12 md:px-16 lg:px-20 cursor-pointer"
        >
          <div className="hidden md:flex flex-col md:items-end items-center text-center md:text-right">
            <h1 className="text-[30px] md:text-[35px] font-bold text-white">
              TAP INTO YOUR POTENTIAL
            </h1>
            <h2 className="text-[18px] md:text-[22px] text-white">
              EXPLORING PUMA TRAINING COLLECTION
            </h2>
          </div>
          <button className="hidden md:block px-4 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-md cursor-pointer">
            SHOP NOW
          </button>
        </Link>
        <Link href="/products/apparel" className="md:hidden w-full flex flex-col items-center justify-center gap-2 my-5 text-center cursor-pointer">
          <h1 className="text-[20px] font-bold text-black">TAP INTO YOUR POTENTIAL</h1>
          <h2 className="text-[16px] text-black">EXPLORING PUMA TRAINING COLLECTION</h2>
          <button className="px-4 py-2 bg-white hover:bg-[#DFE0E1] font-semibold rounded-md cursor-pointer">
            SHOP NOW
          </button>
        </Link>
      </>
    );
  };
  
  export default Block8;
  