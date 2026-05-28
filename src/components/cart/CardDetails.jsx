"use client";

import Image from "next/image";
import React, { useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import { IoChevronDownSharp } from "react-icons/io5";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useCart } from "@/context/CartContext";
import { calculatePrice, formatPrice } from "@/utils/price";

const CardDetails = ({ compact = false }) => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [hoverQty, setHoverQty] = useState({});

  const handleSelect = (qty, itemId) => {
    updateQuantity(itemId, qty);
    setHoverQty((prev) => ({ ...prev, [itemId]: qty }));
    setOpenDropdownId(null);
  };

  const handleDelete = (itemId) => {
    removeFromCart(itemId);
  };

  const handleDropdownToggle = (e, id) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleOutsideClick = () => {
    setOpenDropdownId(null);
  };
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-2xl font-bold text-gray-500">Your cart is empty</div>
        <p className="text-gray-400 mt-2">Add some items to get started</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-5">
        {cart.map((item) => {
          const { unitPrice, totalPrice, discountAmount } = calculatePrice({
            basePrice: item.basePrice,
            discountType: item.discountType,
            discountValue: item.discountValue,
            quantity: item.quantity,
          });

          return (
            <div className={`border border-[#e5e7eb] ${compact ? 'text-sm' : ''}`} key={item.id}>
              <div className={`p-4 ${compact ? 'flex flex-col gap-3' : 'sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6'}`}>
                <div className={`relative shrink-0 bg-[#f4f4f4] rounded flex items-center justify-center p-2 ${compact ? 'w-full max-w-[150px] mx-auto' : 'w-28 sm:w-36 md:w-40'}`}>
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={200}
                    height={200}
                    className="object-contain mix-blend-multiply w-full h-auto"
                  />
                  {item.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-[#eaf8ee] border border-[#c4d477] flex items-center justify-center rounded-full gap-1 px-2 py-0.5 shadow-sm">
                      <FaCheckCircle className="text-[12px] text-[#4d7d04]" />
                      <span className="text-[9px] font-bold text-[#4d7d04] tracking-wider">
                        IN STOCK
                      </span>
                    </div>
                  )}
                </div>
                <div className={`w-full flex ${compact ? 'flex-col gap-3' : 'flex-col sm:flex-row justify-between gap-4'}`}>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold leading-tight`}>{item.name}</div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {item.color && (
                        <div className={`text-[#6c6c6c] ${compact ? 'text-[13px]' : 'text-[14px] sm:text-[15px]'} font-normal`}>
                          Color: <span className="text-[#191919]">{item.color}</span>
                        </div>
                      )}
                      <div className={`text-[#6c6c6c] ${compact ? 'text-[13px]' : 'text-[14px] sm:text-[15px]'} font-normal`}>
                        Size: <span className="text-[#191919]">{item.size}</span>
                      </div>
                      {item.styleNumber && (
                        <div className={`text-[#6c6c6c] ${compact ? 'text-[13px]' : 'text-[14px] sm:text-[15px]'} font-normal`}>
                          Style: <span className="text-[#191919]">{item.styleNumber}</span>
                        </div>
                      )}
                    </div>
                    <div className={compact ? 'mt-1' : 'mt-3'}>
                      <div className="relative inline-block">
                        <button
                          className={`border border-gray-300 rounded-md cursor-pointer bg-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-gray-400 hover:border-gray-400 transition-colors shadow-sm font-semibold ${compact ? 'px-2 py-1 min-w-[60px] text-xs' : 'px-4 py-2 min-w-[80px] text-sm'}`}
                          onClick={(e) => handleDropdownToggle(e, item.id)}
                          aria-label={`Change quantity for ${item.name}`}
                          aria-expanded={openDropdownId === item.id}>
                          {item.quantity} <IoChevronDownSharp />
                        </button>
                        {openDropdownId === item.id && (
                          <div>
                            <ul className="absolute left-0 mt-1 w-20 border bg-white rounded-md shadow-lg z-10">
                              <li className="p-1 text-gray-400 cursor-not-allowed">
                                Qty
                              </li>
                              {Array.from({ length: Math.min(10, item.stock) }, (_, i) => i + 1).map(
                                (qty) => (
                                  <li
                                    key={qty}
                                    className={`p-1 cursor-pointer ${
                                      hoverQty[item.id] === qty
                                        ? "bg-blue-500 text-white"
                                        : "hover:bg-blue-500 hover:text-white"
                                    }`}
                                    onClick={() => handleSelect(qty, item.id)}
                                    onMouseEnter={() =>
                                      setHoverQty((prev) => ({
                                        ...prev,
                                        [item.id]: qty,
                                      }))
                                    }>
                                    {qty}
                                  </li>
                                )
                              )}
                            </ul>
                            <div
                              className="fixed inset-0"
                              onClick={handleOutsideClick}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`flex ${compact ? 'flex-row justify-between items-center w-full mt-2' : 'flex-row sm:flex-col items-center sm:items-end justify-between gap-4 mt-2 sm:mt-0'}`}>
                    <div className={`flex ${compact ? 'flex-col items-start' : 'flex-col items-start sm:items-end'}`}>
                      <div
                        className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-bold ${
                          item.discountType ? "text-[#ba2b20]" : "text-black"
                        }`}>
                        {formatPrice(totalPrice)}
                      </div>
                      {item.discountType && (
                        <div className={`${compact ? 'text-xs' : 'text-sm sm:text-base'} font-semibold text-[#8c8c8c] line-through mt-0.5`}>
                          {formatPrice(item.basePrice * item.quantity)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className={`hover:bg-[#d8d9da] cursor-pointer rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 ${compact ? 'text-[16px] w-8 h-8' : 'text-[20px] w-10 h-10'}`}
                        aria-label={`Edit ${item.name}`}
                        title="Edit item">
                        <BiEditAlt />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`hover:bg-[#d8d9da] cursor-pointer rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 ${compact ? 'text-[16px] w-8 h-8' : 'text-[20px] w-10 h-10'}`}
                        aria-label={`Remove ${item.name} from cart`}
                        data-testid={`remove-${item.id}`}>
                        <RiDeleteBin5Line />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardDetails;
