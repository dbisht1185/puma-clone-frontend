"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { CgHeart } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { calculatePrice, formatPrice } from "@/utils/price";

const Page = () => {
  const router = useRouter();
  const path = usePathname();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    const success = addToCart({
      productId: item.productId,
      name: item.name,
      image: item.image,
      size: "One Size",
      basePrice: item.basePrice,
      discountType: item.discountType,
      discountValue: item.discountValue,
      quantity: 1,
      stock: 10,
      color: "",
      styleNumber: "",
    });

    if (success) {
      // Optionally show success message
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  return (
    <div className="w-full">
      <div className="lg:w-[70%] w-[95%] m-auto flex flex-col my-10 gap-5">
        <div className="w-full text-black">
          <Link href="/" className="font-bold cursor-pointer">
            Home
          </Link>
          <span className="mx-1 text-gray-500"> • </span>
          <Link
            href="/account"
            onClick={() => {
              if (path !== "/account" && typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("route-change-start"));
              }
            }}
            className="font-bold cursor-pointer"
          >
            My account
          </Link>
          <span className="mx-1 text-gray-500"> • </span>
          <Link href="/account/wishlist" className="font-normal cursor-pointer">
            {path.split("/").pop()}
          </Link>
        </div>

        <div className="flex flex-col pb-5">
          <div className="text-5xl font-bold">My account</div>
        </div>

        <div className="w-full sm:border rounded-2xl sm:border-[#e5e7eb] sm:p-10 flex flex-col">
          <div className="w-full flex flex-col justify-between gap-5 mb-5">
            <div className="flex justify-between">
              <div className="text-2xl font-normal">My Wishlist</div>
              <div className="text-[20px] font-normal">
                <span>{wishlist.length}</span> {wishlist.length === 1 ? "item" : "items"}
              </div>
            </div>
            <div className="border-b border-[#e5e7eb]"></div>
          </div>

          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <CgHeart className="text-[100px] text-[#e5e7eb] font-bold" />
              <div className="text-[28px] font-bold text-center mt-4">Your Wishlist is Empty</div>
              <p className="text-gray-500 text-center mt-2">Start adding items you love to your wishlist</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => {
                const { unitPrice: itemPrice } = calculatePrice({
                  basePrice: item.basePrice,
                  discountType: item.discountType,
                  discountValue: item.discountValue,
                  quantity: 1,
                });

                return (
                  <div
                    key={item.productId}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    {/* Image Container */}
                    <Link href={`/productdetails/${item.slug || item.productId}`} className="block">
                      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Remove from wishlist button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWishlist(item.productId);
                          }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                          aria-label="Remove from wishlist">
                          <FaHeart className="text-red-500 text-lg" />
                        </button>
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="p-4 flex flex-col gap-3">
                      <Link href={`/productdetails/${item.slug || item.productId}`}>
                        <h3 className="font-semibold text-base line-clamp-2 hover:text-gray-600 cursor-pointer">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-lg">
                          {formatPrice(itemPrice)}
                        </span>
                        {item.discountType && item.discountValue > 0 && (
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(item.basePrice)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 px-4 py-2 bg-black text-white font-bold text-sm rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer">
                          ADD TO CART
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.productId)}
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                          aria-label="Remove from wishlist">
                          <FaHeart className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          onClick={() => {
            if (path !== "/account" && typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("route-change-start"));
            }
            router.push("/account");
          }}
          className="flex items-center justify-center cursor-pointer">
          <span className="border-b-3 border-[#a1a8af] hover:border-black text-sm font-bold cursor-pointer">
            RETURN TO MY ACCOUNT
          </span>
        </div>
      </div>
    </div>
  );
};

export default Page;
