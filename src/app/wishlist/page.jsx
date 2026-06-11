"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { calculatePrice, formatPrice } from "@/utils/price";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { CgHeart } from "react-icons/cg";
import { useRouter } from "next/navigation";

const Page = () => {
  const { wishlist, removeFromWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (item) => {
    // Add to cart with default size and quantity
    const success = addToCart({
      productId: item.productId,
      name: item.name,
      image: item.image,
      size: "One Size", // Default size for wishlist items
      basePrice: item.basePrice,
      discountType: item.discountType,
      discountValue: item.discountValue,
      quantity: 1,
      stock: 10, // Default stock
      color: "",
      styleNumber: "",
    });

    if (success) {
      // Optionally remove from wishlist after adding to cart
      // removeFromWishlist(item.productId);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const { unitPrice } = calculatePrice({
    basePrice: 0,
    discountType: null,
    discountValue: 0,
    quantity: 1,
  });

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="lg:w-[90%] w-[95%] m-auto flex flex-col my-10 gap-5">
        {/* Breadcrumb */}
        <div className="w-full text-black">
          <Link href="/" className="font-bold cursor-pointer">
            Home
          </Link>
          <span className="mx-1 text-gray-500"> • </span>
          <span className="font-normal">Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex flex-col pb-5">
          <div className="text-5xl font-bold">My Wishlist</div>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <div className="w-full sm:border h-[525px] rounded-2xl sm:border-[#e5e7eb] sm:p-10 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <CgHeart className="text-[100px] text-[#e5e7eb] font-bold" />
              <div className="text-[28px] font-bold text-center">Your Wishlist is Empty</div>
              <p className="text-gray-500 text-center">Start adding items you love to your wishlist</p>
              <Link
                href="/products/all"
                className="mt-4 px-6 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition-colors cursor-pointer">
                SHOP NOW
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex justify-between items-center mb-5">
              <div className="text-2xl font-normal">
                My Wishlist ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
              </div>
            </div>

            <div className="border-b border-[#e5e7eb] mb-5"></div>

            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                          unoptimized={typeof item.image === 'string' && item.image.startsWith('http')}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

