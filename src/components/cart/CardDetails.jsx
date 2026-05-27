"use client";

import Image from "next/image";
import React, { useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import { IoChevronDownSharp } from "react-icons/io5";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useCart } from "@/context/CartContext";
import { calculatePrice, formatPrice } from "@/utils/price";

const CardDetails = () => {
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
            <div className="border border-[#e5e7eb]" key={item.id}>
              <div className="m-5 flex gap-5">
                <div className="h-full relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={250}
                    height={250}
                    className="object-contain"
                  />
                  {item.stock > 0 && (
                    <div className="hidden absolute bottom-1 border border-[#c4d477] sm:flex items-center justify-center rounded-full gap-1 px-2 py-1">
                      <div className="text-[16px] font-bold text-[#4d7d04]">
                        <FaCheckCircle />
                      </div>
                      <div className="text-[10px] font-bold text-[#4d7d04]">
                        IN STOCK
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full md:flex flex-row justify-between gap-5">
                  <div className="flex flex-col gap-3">
                    <div className="text-xl font-bold">{item.name}</div>
                    <div>
                      {item.color && (
                        <div className="text-[#6c6c6c] text-[16px] font-normal">
                          Color: <span className="text-[#191919]">{item.color}</span>
                        </div>
                      )}
                      <div className="text-[#6c6c6c] text-[16px] font-normal">
                        Size: <span className="text-[#191919]">{item.size}</span>
                      </div>
                      {item.styleNumber && (
                        <div className="text-[#6c6c6c] text-[16px] font-normal">
                          Style Number:{" "}
                          <span className="text-[#191919]">{item.styleNumber}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="relative inline-block">
                        <button
                          className="border border-gray-400 p-2 rounded-[2px] w-23 h-14 cursor-pointer bg-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-gray-400"
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

                  <div className="flex flex-col items-start sm:flex md:flex-col sm:justify-between md:justify-start sm:flex-row-reverse lg:gap-5 sm:gap-0 gap-5 md:my-0 my-5">
                    <div>
                      <div
                        className={`text-xl font-bold ${
                          item.discountType ? "text-[#ba2b20]" : "text-black"
                        }`}>
                        {formatPrice(totalPrice)}
                      </div>
                      {item.discountType && (
                        <div className="text-xl font-bold text-[#8c8c8c] line-through">
                          {formatPrice(item.basePrice * item.quantity)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      <button
                        className="text-[20px] hover:bg-[#d8d9da] w-10 h-10 cursor-pointer rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400"
                        aria-label={`Edit ${item.name}`}
                        title="Edit item">
                        <BiEditAlt />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[20px] hover:bg-[#d8d9da] w-10 h-10 cursor-pointer rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400"
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
