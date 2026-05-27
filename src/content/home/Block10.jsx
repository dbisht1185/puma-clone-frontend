import Swipers from "@/components/Home/Swiper/Swipers";
import { TopTrendingDatas } from "@/constant/Home/TopTrendingData";

const Block10 = () => {
  return (
    <div className="w-full px-5">
         <div className="text-black flex">
            <div className="text-[25px] font-bold">TOP TRENDING</div>
          </div>
      <div className="container mx-auto py-6" >
        <Swipers data={TopTrendingDatas} />
      </div>
    </div>
  );
};

export default Block10;
