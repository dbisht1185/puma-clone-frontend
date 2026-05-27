import Swipers from "@/components/Home/Swiper/Swipers";
import { RecentlyViewedDatas } from "@/constant/Home/RecentlyViewedData";

const Block11 = () => {
  return (
    <div className="w-full px-5">
         <div className="text-black flex">
            <div className="text-[25px] font-bold">RECENTLY VIEWED BY YOU</div>
          </div>
      <div className="container mx-auto py-6" >
        <Swipers data={RecentlyViewedDatas} />
      </div>
    </div>
  );
};

export default Block11;
