"use client";

import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";
import { bonusItems } from "@/constant/cart/bonusItems";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/toaster";
import { parsePrice } from "@/utils/price";
import { FaCheckCircle } from "react-icons/fa";

const BonusItemSelector = ({ open, onClose }) => {
  const { addToCart, cart } = useCart();
  const { setAlert } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);

  // Check if item is already in cart
  const isItemInCart = (productId) => {
    return cart.some((item) => item.productId === productId);
  };

  // Check if item is selected in bonus selector
  const isItemSelected = (productId) => {
    return selectedItems.includes(productId);
  };

  const handleToggleItem = (item) => {
    if (isItemInCart(item.productId)) {
      setAlert({
        open: true,
        message: "This item is already in your cart",
        severity: "info",
      });
      return;
    }

    setSelectedItems((prev) => {
      if (prev.includes(item.productId)) {
        return prev.filter((id) => id !== item.productId);
      } else {
        return [...prev, item.productId];
      }
    });
  };

  const handleAddSelectedToCart = () => {
    if (selectedItems.length === 0) {
      setAlert({
        open: true,
        message: "Please select at least one bonus item",
        severity: "warning",
      });
      return;
    }

    let addedCount = 0;
    selectedItems.forEach((productId) => {
      const item = bonusItems.find((bi) => bi.productId === productId);
      if (item && !isItemInCart(item.productId)) {
        const success = addToCart({
          productId: item.productId,
          name: item.name,
          image: item.image,
          size: item.size || "One Size",
          basePrice: item.basePrice,
          discountType: item.discountType,
          discountValue: item.discountValue,
          quantity: 1,
          stock: item.stock,
          color: "",
          styleNumber: "",
        });
        if (success) addedCount++;
      }
    });

    if (addedCount > 0) {
      setAlert({
        open: true,
        message: `${addedCount} bonus item(s) added to cart`,
        severity: "success",
      });
      setSelectedItems([]);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          maxHeight: "90vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(4px)",
          },
        },
      }}>
      <DialogTitle className="flex items-center justify-between border-b pb-4">
        <div className="text-2xl font-bold">Select Bonus Items</div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Close">
          <RxCross2 className="text-2xl" />
        </button>
      </DialogTitle>
      <DialogContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {bonusItems.map((item) => {
            const inCart = isItemInCart(item.productId);
            const selected = isItemSelected(item.productId);
            const unitPrice = item.offerPrice
              ? parsePrice(item.offerPrice)
              : parsePrice(item.price);

            return (
              <div
                key={item.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selected
                    ? "border-black border-2 bg-gray-50"
                    : inCart
                    ? "border-green-500 border-2 opacity-75"
                    : "border-gray-300 hover:border-gray-500"
                }`}
                onClick={() => !inCart && handleToggleItem(item)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === "Enter" && !inCart && handleToggleItem(item)}
                aria-label={`Select ${item.name}`}>
                <div className="relative aspect-square w-full mb-3 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain rounded"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300/f0f0f0/999999?text=PUMA+Socks';
                    }}
                  />
                  {selected && (
                    <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1">
                      <FaCheckCircle className="text-lg" />
                    </div>
                  )}
                  {inCart && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      IN CART
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-sm line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    {item.offerPrice ? (
                      <>
                        <span className="text-red-600 font-bold text-sm">
                          {item.offerPrice}
                        </span>
                        <span className="text-gray-500 line-through text-xs">
                          {item.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-black font-bold text-sm">{item.price}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                  {inCart && (
                    <div className="text-xs text-green-600 font-semibold mt-1">
                      Already in cart
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400">
            CANCEL
          </button>
          <button
            onClick={handleAddSelectedToCart}
            disabled={selectedItems.length === 0}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 font-bold cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Add selected items to cart">
            ADD {selectedItems.length > 0 ? `${selectedItems.length} ` : ""}TO CART
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BonusItemSelector;

