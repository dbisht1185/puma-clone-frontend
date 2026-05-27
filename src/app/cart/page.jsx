"use client";
import { LiaShippingFastSolid } from "react-icons/lia";
import { GrPowerReset } from "react-icons/gr";
import { GoGift } from "react-icons/go";
import Swipers from "@/components/Home/Swiper/Swipers";
import PaymentPartners from "@/components/cart/PaymentPartners";
import Link from "next/link";
import CardDetails from "@/components/cart/CardDetails";
import ApplyPromo from "@/components/cart/ApplyPromo";
import TotalPrice from "@/components/cart/TotalPrice";
import BonusItemSelector from "@/components/cart/BonusItemSelector";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const Page = () => {
  const { cart, getCartTotals } = useCart();
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [bonusItemOpen, setBonusItemOpen] = useState(false);
  const { itemCount } = getCartTotals();

  return (
    <>
      <div className="w-full lg:px-10 lg:py-10 px-5 py-5 flex flex-col gap-5">
        <div className="w-full text-[32px] font-bold">
          {" "}
          My Shopping Cart{" "}
          <span className="text-[32px] font-bold text-[#6c6c6c]">({itemCount})</span>
        </div>
        <div className="w-full grid lg:grid-cols-10 grid-cols-5 gap-10 ">
          <div className="grid lg:col-span-6 col-span-6">
            <CardDetails />
          </div>
          <div className="w-full grid lg:col-span-4 col-span-6">
            <div className="w-full flex flex-col  gap-5">
              <div className="border border-[#dfe0e1] rounded-md flex gap-2 items-center justify-center text-[#17913a] py-2 ">
                <div className="text-[20px] font-bold">
                  <LiaShippingFastSolid />
                </div>
                <div className="text-[14px] font-bold">
                  YOU’VE EARNED FREE SHIPPING
                </div>
              </div>
              <div className="border border-[#dfe0e1] rounded-md flex gap-2 items-center justify-center text-[#818181] py-2">
                <div className="text-[20px] font-bold">
                  <GrPowerReset />
                </div>
                <div className="text-[14px] font-bold">
                  YOU’VE EARNED FREE SHIPPING
                </div>
              </div>
              <div className="w-full rounded-[2px]">
                <ApplyPromo onPromoApplied={setPromoDiscount} />
              </div>

              <button
                onClick={() => setBonusItemOpen(true)}
                className="border border-[#dfe0e1] rounded-[2px] flex gap-2 items-center justify-center text-white cursor-pointer py-2 bg-[#999999] hover:bg-[#888888] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
                aria-label="Select bonus items">
                <div className="font-bold text-xl">
                  <GoGift />
                </div>
                <div className="font-bold text-[16px]">
                  CLICK HERE TO SELECT BONUS ITEM
                </div>
              </button>
              
              <BonusItemSelector
                open={bonusItemOpen}
                onClose={() => setBonusItemOpen(false)}
              />

              <TotalPrice promoDiscount={promoDiscount} />
              <Link
                href={cart.length > 0 ? "/checkout" : "#"}
                className={`w-full border text-lg font-bold text-white rounded-[2px] py-4 cursor-pointer text-center ${
                  cart.length > 0
                    ? "bg-[#181818] hover:bg-[#3b4047]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                aria-disabled={cart.length === 0}
                data-testid="checkout-link">
                CHECKOUT
              </Link>

              <div className="text-[12px] font-normal">
                By continuing, I confirm that I have read and accept the {"  "}
                <span className="underline">
                  Terms and Conditionsand
                </span> the {"  "}
                <span className="underline">Privacy Policy</span>.
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="text-2xl font-bold">CUSTOMERS ALSO ORDERED</div>
          <Swipers />
        </div>
      </div>
      <div className="w-full bg-[#fafafa] mb-10">
        <PaymentPartners />
      </div>
    </>
  );
};

export default Page;
