import Link from "next/link";

const Block5 = () => {
  return (
    <div className="w-full flex flex-col gap-5 mt-5 ">
      <div className="md:px-8 px-4 flex items-center justify-center">
        <h1 className="md:text-[21px] text-[15px] md:font-bold font-semibold text-black">
          YOUR FAVOURITE TEAMS ARE BACK
        </h1>
      </div>

      <div className="w-full flex gap-4 px-4 md:px-10 lg:gap-6">
        <Link href="/products/footwear" className="w-[calc(50%-0.5rem)] relative aspect-[3/4] cursor-pointer">
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-center flex flex-col items-end justify-end p-4 md:p-8"
            style={{
              backgroundImage: `url(https://cdn.sanity.io/images/qa41whrn/prod/51b49e9ddb4cdf240700c9bbc0a5dffe0de8f9ad-2083x2708.jpg)`,
            }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="relative z-10 w-full text-center">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[42px] font-bold text-white drop-shadow-md">
                PUMA X RCB
              </h1>
            </div>
          </div>
        </Link>

        <Link href="/products/footwear" className="w-[calc(50%-0.5rem)] relative aspect-[3/4] cursor-pointer">
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-center flex flex-col items-end justify-end p-4 md:p-8"
            style={{
              backgroundImage: `url(https://cdn.sanity.io/images/qa41whrn/prod/d85737fa142e19207439db364d2a3cf940dd28ff-1000x1300.jpg)`,
            }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="relative z-10 w-full text-center">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[42px] font-bold text-white drop-shadow-md">
                PUMA X DC
              </h1>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Block5;
