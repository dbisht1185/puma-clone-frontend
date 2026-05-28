"use client";
import { LiaShippingFastSolid } from "react-icons/lia";
import { GrPowerReset } from "react-icons/gr";
import { GoGift } from "react-icons/go";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";
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
      <div className="w-full lg:px-10 lg:py-10 px-5 py-5 flex flex-col gap-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-[32px] font-extrabold tracking-tight">
            My Shopping Cart{" "}
            <span className="text-[32px] font-bold text-[#6c6c6c] ml-2">({itemCount})</span>
          </div>
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-bold border-b-2 border-transparent hover:border-black transition-colors pb-0.5"
          >
            <FiArrowLeft size={16} /> CONTINUE SHOPPING
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <FiShoppingBag size={64} className="text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              href="/"
              className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors rounded-sm"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
        <div className="w-full grid lg:grid-cols-10 grid-cols-1 gap-8 lg:gap-12">
          <div className="grid lg:col-span-6 col-span-1">
            <CardDetails />
          </div>
          <div className="w-full grid lg:col-span-4 col-span-1">
            <div className="w-full flex flex-col gap-5 bg-white p-6 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 h-fit">
              <div className="border border-[#dfe0e1] rounded-lg flex gap-3 items-center justify-center text-[#17913a] py-3 bg-[#f3fbf5] transition-all hover:bg-[#eaf8ee]">
                <div className="text-[24px]">
                  <LiaShippingFastSolid />
                </div>
                <div className="text-[13px] font-bold tracking-wide">
                  YOU’VE EARNED FREE SHIPPING
                </div>
              </div>
              <div className="border border-[#dfe0e1] rounded-lg flex gap-3 items-center justify-center text-gray-600 py-3 bg-gray-50 transition-all hover:bg-gray-100">
                <div className="text-[20px]">
                  <GrPowerReset />
                </div>
                <div className="text-[13px] font-bold tracking-wide">
                  FREE RETURNS ON ALL ORDERS
                </div>
              </div>
              <div className="w-full rounded-[2px]">
                <ApplyPromo onPromoApplied={setPromoDiscount} />
              </div>

              <button
                onClick={() => setBonusItemOpen(true)}
                className="border border-[#dfe0e1] rounded flex gap-3 items-center justify-center text-white cursor-pointer py-3.5 bg-[#181818] hover:bg-[#3b4047] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 w-full shadow-sm"
                aria-label="Select bonus items">
                <div className="font-bold text-xl">
                  <GoGift />
                </div>
                <div className="font-bold text-[14px] tracking-wide">
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

              <div className="text-[12px] font-normal text-gray-500 leading-relaxed mt-2">
                By continuing, I confirm that I have read and accept the {"  "}
                <span className="underline hover:text-black cursor-pointer transition-colors">
                  Terms and Conditions
                </span> and the {"  "}
                <span className="underline hover:text-black cursor-pointer transition-colors">Privacy Policy</span>.
              </div>
            </div>
          </div>
        </div>
        )}
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
