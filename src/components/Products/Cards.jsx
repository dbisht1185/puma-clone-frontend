"use client";

import { CardDatas } from "@/constant/Products/Cards";
import Image from "next/image";
import Link from "next/link";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useWishlist } from "@/context/WishlistContext";
import { useCallback } from "react";

const Cards = ({ filteredProducts = null }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const products = filteredProducts !== null ? filteredProducts : CardDatas;

  const handleWishlistClick = useCallback(
    (e, item) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist({
        productId: item.productId || item.slug || `product-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: item.name,
        image: item.img,
        basePrice: item.basePrice || parseFloat(item.price?.replace(/[₹,\s]/g, "") || item.offerPrice?.replace(/[₹,\s]/g, "") || "0"),
        discountType: item.offerPrice ? "PERCENT" : null,
        discountValue: item.offerPrice ? 20 : 0,
        slug: item.slug || item.productId || item.name.toLowerCase().replace(/\s+/g, "-"),
      });
    },
    [toggleWishlist]
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 sm:gap-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
        {products.map((item, index) => {
          const productId = item.productId || item.slug || `product-${item.name.toLowerCase().replace(/\s+/g, "-")}`;
          const slug = item.slug || productId;
          const inWishlist = isInWishlist(productId);
          
          const isOutOfStock = (item.stock || 0) === 0;
          
          return (
            <div key={index} className="flex flex-col overflow-hidden relative group">
              <Link href={`/productdetails/${slug}`} className="flex flex-col cursor-pointer">
                <div className="relative aspect-square w-full">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className={`object-contain ${isOutOfStock ? "opacity-60" : ""}`}
                    priority={index < 4}
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
                      <div className="bg-red-600 text-white px-4 py-2 rounded font-bold text-sm md:text-base">
                        OUT OF STOCK
                      </div>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleWishlistClick(e, item)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    data-testid={`wishlist-btn-${productId}`}>
                    {inWishlist ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-700 text-lg" />
                    )}
                  </button>
                </div>

                <div className="flex flex-1 flex-col bg-white py-5 space-y-3">
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="truncate text-[16px] font-bold text-gray-900 flex-1">
                      {item.name}
                    </h3>
                    {item.offerPrice ? (
                      <span className="text-red-600 font-bold">
                        {item.offerPrice}
                      </span>
                    ) : (
                      <span className="text-black font-bold">{item.price}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <p className="text-xs text-red-500 truncate flex-1">
                      {item.description || ""}
                    </p>
                    <span
                      className={`text-large whitespace-nowrap ${
                        item.offerPrice
                          ? "text-gray-500 line-through"
                          : "font-bold text-gray-900"
                      }`}>
                      {item.offerPrice && (
                        <span className="text-gray-500 line-through">
                          {item.price}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cards;
