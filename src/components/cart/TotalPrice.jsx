"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/price";

const TotalPrice = ({ promoDiscount = 0 }) => {
  const { getCartTotals } = useCart();
  const { subtotal, totalDiscount, total } = getCartTotals();

  const shippingCost = subtotal >= 5000 ? 0 : 0; // Free shipping threshold
  const finalTotal = total - promoDiscount + shippingCost;

  return (
    <div className="flex flex-col gap-5">
      {promoDiscount > 0 && (
        <div className="flex justify-between">
          <div className="text-[14px] font-normal">PROMO CODE APPLIED</div>
          <div className="text-[14px] font-normal text-[#008626]">
            -{formatPrice(promoDiscount)}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[#6c6c6c] text-[14px] font-bold">
          <div>SUBTOTAL</div>
          <div>{formatPrice(subtotal)}</div>
        </div>
        <div className="flex justify-between text-[#6c6c6c] text-[14px] font-bold">
          <div>SHIPPING COST</div>
          <div>{formatPrice(shippingCost)}</div>
        </div>
        {totalDiscount > 0 && (
          <div className="flex justify-between text-[#6c6c6c] text-[14px] font-bold">
            <div>ORDER DISCOUNT</div>
            <div>-{formatPrice(totalDiscount)}</div>
          </div>
        )}
      </div>
      <div className="border-b border-[#d5d5d5]"></div>
      <div className="flex justify-between">
        <div className="text-xl font-bold">
          GRAND TOTAL{" "}
          <span className="text-sm font-bold text-[#6c6c6c]">
            PRICES INCLUDE GST
          </span>
        </div>
        <div className="text-xl font-bold">{formatPrice(Math.max(0, finalTotal))}</div>
      </div>
    </div>
  );
};

export default TotalPrice