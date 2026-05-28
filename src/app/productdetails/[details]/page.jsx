"use client";
import { NavigationDatass } from "@/constant/ProductsDerails/NavigationDatas";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RiRulerLine } from "react-icons/ri";
import { IoChevronDownSharp } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaArrowRotateRight, FaTruckFast } from "react-icons/fa6";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import Photos from "@/components/productDetails/Photos";
import Swipers from "@/components/Home/Swiper/Swipers";
import ProductStory from "@/components/productDetails/ProductStory";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CardDatas } from "@/constant/Products/Cards";
import ReadMore from "@/components/ReadMore";
import { calculatePrice, formatPrice, parsePrice } from "@/utils/price";
import { productsApi } from "@/mocks/products";
import { pincodesApi } from "@/mocks/pincodes";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [hoverQty, setHoverQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [pinCode, setPinCode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const slug = params.details;

  // Use TanStack Query to fetch the full database product dynamically
  const { data: product = {
    productId: slug,
    slug: slug,
    name: "Easy Rider Leather Unisex Sneakers",
    price: "₹8,999",
    offerPrice: "₹7,199",
    description: "",
    img: "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg",
    basePrice: 8999,
    discountType: "PERCENT",
    discountValue: 20,
    stock: 10,
  }, isLoading: dbLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await productsApi.getProductByIdOrSlug(slug);
      return res.data?.status === "SUCCESS" ? res.data.data : null;
    },
    initialData: () => {
      return CardDatas.find((item) => item.slug === slug || item.productId === slug);
    },
  });

  // Track recently viewed products in localStorage for dynamic Block11 homepage rendering
  useEffect(() => {
    if (product && product.name && typeof window !== "undefined") {
      const stored = localStorage.getItem("recentlyViewed");
      let list = [];
      try {
        list = stored ? JSON.parse(stored) : [];
      } catch (e) {
        list = [];
      }

      // Filter out duplicate entries by name
      list = list.filter((item) => item.name !== product.name);

      // Add current product to the top of recently viewed
      list.unshift({
        name: product.name,
        price: product.price || `₹${product.basePrice?.toLocaleString("en-IN")}`,
        offerPrice: product.offerPrice,
        img: product.img,
      });

      // Maintain max of 10 items
      list = list.slice(0, 10);

      localStorage.setItem("recentlyViewed", JSON.stringify(list));
    }
  }, [product]);

  // Set default color when product loads
  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    } else if (product?.color && !selectedColor) {
      setSelectedColor({ colorName: product.color, colorCode: product.colorCode || "#000000" });
    }
  }, [product, selectedColor]);

  const productId = product?.productId || product?.slug;
  const inWishlist = productId ? isInWishlist(productId) : false;
  const isOutOfStock = (product?.stock || 0) === 0;
  
  // Available sizes dynamically pulled from database, falling back to static
  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : [
    { size: "UK 5", stock: 3 },
    { size: "UK 6", stock: 5 },
    { size: "UK 11", stock: 2 },
    { size: "UK 12", stock: 0 },
    { size: "UK 13", stock: 1 },
  ];

  const basePrice = product?.basePrice || parsePrice(product?.price || 0);
  const discountType = product?.discountType || (product?.offerPrice ? "PERCENT" : null);
  const discountValue = product?.discountValue || (product?.offerPrice ? 20 : 0);
  
  const { unitPrice, discountAmount } = calculatePrice({
    basePrice,
    discountType,
    discountValue,
    quantity: selectedQty,
  });

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const images = product?.images && product.images.length > 0 ? product.images : [
    product?.img || "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg",
    "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers (6).jpeg",
    "/Images/Products/cards/Easy-Rider-Mesh-Unisex-Sneakers.jpeg",
  ];

  const handleSelect = (qty) => {
    const selectedSizeData = sizes.find((s) => s.size === selectedSize);
    const maxStock = selectedSizeData?.stock || product?.stock || 10;
    
    if (qty > maxStock) {
      return;
    }
    
    setSelectedQty(qty);
    setHoverQty(qty);
    setIsOpen(false);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const sizeData = sizes.find((s) => s.size === size);
    if (sizeData && sizeData.stock < selectedQty) {
      setSelectedQty(Math.min(selectedQty, sizeData.stock));
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    if (!selectedSize) {
      // Show error - size required
      return;
    }

    const sizeData = sizes.find((s) => s.size === selectedSize);
    if (sizeData && sizeData.stock === 0) {
      alert("This size is out of stock");
      return;
    }

    const stock = sizeData?.stock || product?.stock || 10;

    const success = addToCart({
      productId,
      name: product?.name,
      image: product?.img,
      size: selectedSize,
      basePrice,
      discountType,
      discountValue,
      quantity: selectedQty,
      stock,
      color: selectedColor ? selectedColor.colorName : (product?.color || "PUMA Black-Frosted Ivory"),
      styleNumber: product?.styleNumber || "",
    });

    if (success) {
      // Optionally redirect to cart or show success message
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      productId,
      name: product?.name,
      image: product?.img,
      basePrice,
      discountType,
      discountValue,
      slug: product?.slug || productId,
    });
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation(); // Prevents closing immediately after opening
    setIsOpen(!isOpen);
  };

  const handleOutsideClick = () => {
    setIsOpen(false);
    setHoverQty(selectedQty); // Reset hover when closing
  };

  // Dynamic function to check delivery based on pincode API
  const checkDelivery = async (codeToCheck = null) => {
    const code = codeToCheck || pinCode;
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setDeliveryInfo({
        error: "Please enter a valid 6-digit PIN code",
      });
      return;
    }

    setCheckingDelivery(true);
    
    try {
      const res = await pincodesApi.checkPincode(code);
      
      if (res.data && res.data.status === "SUCCESS") {
        const pincodeData = res.data.data;
        
        // Calculate dynamic delivery date based on deliveryDays from database
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + (pincodeData.deliveryDays || 3));
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        setDeliveryInfo({
          pinCode: code,
          deliveryDate: deliveryDate.toLocaleDateString('en-IN', options),
          deliveryTime: `${pincodeData.deliveryDays} business days`,
          isServiceable: pincodeData.isServiceable,
          charges: pincodeData.charges,
        });
      } else {
        // Handle gracefully resolved errors from apiClient interceptor
        setDeliveryInfo({
          error: res.data?.message || "Delivery not available to this PIN code.",
        });
      }
    } catch (error) {
      setDeliveryInfo({
        error: error?.message || "Delivery not available to this PIN code.",
      });
    } finally {
      setCheckingDelivery(false);
    }
  };

  const handlePinCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only numbers, max 6 digits
    setPinCode(value);
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      // Auto-check when 6 digits are entered - pass value directly to avoid state timing issues
      checkDelivery(value);
    } else {
      setDeliveryInfo(null);
    }
  };

  const handlePinCodeKeyPress = (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      if (value.length === 6 && /^\d{6}$/.test(value)) {
        checkDelivery(value);
      }
    }
  };

  return (
    <div className="w-full lg:px-10 px-3 py-10 flex flex-col gap-5">
      <div className="w-full">
        {NavigationDatass.map((item, index) => (
          <span key={index}>
            <Link
              href={item.link}
              className="cursor-pointer"
              style={{
                textDecoration: "none",
                color:
                  index === NavigationDatass.length - 1 ? "black" : "inherit",
                fontWeight:
                  index === NavigationDatass.length - 1 ? "normal" : "bold",
              }}>
              {item.label}
            </Link>
            {index < NavigationDatass.length - 1 && (
              <span style={{ margin: "0 5px", color: "grey" }}> • </span>
            )}
          </span>
        ))}
      </div>
      <div className="grid md:grid-cols-12 grid-cols-1 gap-5 relative w-full ">
        {/* left */}
        <div className="w-full lg:col-span-8 md:col-span-12 col-span-8 h-full overflow-auto">
          <Photos />
        </div>

        {/* right  */}
        <div className="w-full lg:col-span-4 md:col-span-12 col-span-8 mt-2 h-fit sticky top-20">
          <div className=" flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="text-[30px] font-bold leading-9">
                  {product?.name}
                </div>
                {isOutOfStock && (
                  <div className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">
                    OUT OF STOCK
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[18px] text-red-700 font-bold">
                  {formatPrice(unitPrice)}
                  {product?.offerPrice && (
                    <span className="ml-2 text-[16px] text-black font-normal line-through">
                      {product.price}
                    </span>
                  )}
                </div>
                <div className="text-[15px] text-[#757b80]">
                  Prices include GST
                </div>
                <div className="text-[16px] text-gray-700 leading-relaxed mb-4">
                  {product?.description || "Description not available for this product."}
                </div>
                {!isOutOfStock && product?.stock && product.stock > 0 && (
                  <div className="text-[14px] text-green-600 font-semibold">
                    In Stock ({product.stock} available)
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-[20px]">Color</div>
                <div className="flex items-center gap-3">
                  {selectedColor?.colorCode && (
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedColor.colorCode }}
                    ></div>
                  )}
                  <div className="text-[#757b80] text-[15px] font-medium">
                    {selectedColor?.colorName || "PUMA Black-Frosted Ivory"}
                  </div>
                </div>
              </div>
              
              {/* Color Swatch Selection */}
              {(product?.colors && product.colors.length > 0) && (
                <div className="flex gap-3 flex-wrap mt-1">
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c)}
                      className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                        selectedColor?.colorName === c.colorName 
                          ? "border-black shadow-md scale-110" 
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: c.colorCode }}
                      title={c.colorName}
                      aria-label={`Select color ${c.colorName}`}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-center">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`w-[60px] h-[60px] cursor-pointer p-1 transition-all ${
                      selectedImageIndex === index
                        ? "border-2 border-black"
                        : "border border-gray-300 hover:border-gray-500"
                    } rounded-md`}
                    onClick={() => handleImageClick(index)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === "Enter" && handleImageClick(index)}
                    aria-label={`Select image ${index + 1}`}>
                    <Image
                      src={img}
                      alt="Puma image"
                      width={60}
                      height={50}
                      objectFit="cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b border-[#dfe0e1]"></div>

            <div className="text-[12px] italic">
              Highly recommended for its cushioned fit and finish
            </div>

            <div className="border-b border-[#dfe0e1]"></div>

            <div className="flex flex-col gap-3">
              <div className="flex w-full justify-between">
                <div className="font-bold text-[20px]">Size</div>
                {selectedSize && (
                  <div className="text-[15px] font-semibold">
                    {(() => {
                      const sizeData = sizes.find((s) => s.size === selectedSize);
                      const stock = sizeData?.stock || 0;
                      return stock > 0 ? `ONLY ${stock} LEFT` : "OUT OF STOCK";
                    })()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 w-full justify-start">
                {sizes.map((sizeData) => {
                  const isSelected = selectedSize === sizeData.size;
                  const isOutOfStock = sizeData.stock === 0;
                  
                  return (
                    <button
                      key={sizeData.size}
                      onClick={() => handleSizeSelect(sizeData.size)}
                      disabled={isOutOfStock}
                      className={`border w-[60px] h-[55px] flex items-center justify-center rounded-[2px] transition-all ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : isOutOfStock
                          ? "border-[#dfe0e1] text-gray-400 cursor-not-allowed opacity-50"
                          : "border-[#dfe0e1] cursor-pointer hover:border-black"
                      }`}
                      aria-label={`Select size ${sizeData.size}`}
                      aria-pressed={isSelected}
                      data-testid={`size-${sizeData.size}`}>
                      {sizeData.size}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="flex gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-400 rounded px-1"
                aria-label="Open size guide">
                <div className="border-b font-bold text-[15px] leading-none">
                  SIZE GUIDE
                </div>
                <div className="text-[18px] mb-2 rotate-180">
                  <RiRulerLine />
                </div>
              </button>
            </div>
            <div className="border-b border-[#dfe0e1]"></div>

            <div className="flex gap-5">
              <div>
                <div className="relative inline-block">
                  <div
                    className="border border-gray-400 p-2 rounded-[2px] w-16 h-12 cursor-pointer bg-white flex justify-between items-center"
                    onClick={handleDropdownToggle}>
                    {selectedQty}{" "}
                    <span>
                      <IoChevronDownSharp />
                    </span>
                  </div>
                  {isOpen && (
                    <div>
                      <ul
                        className="absolute left-0 mt-1 w-20 border bg-white rounded-md shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}>
                        <li className="p-2 text-center text-gray-400 cursor-not-allowed">
                          Qty
                        </li>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (qty) => (
                            <li
                              key={qty}
                              className={`p-2 text-center cursor-pointer ${
                                hoverQty === qty
                                  ? "bg-blue-500 text-white"
                                  : "hover:bg-blue-500 hover:text-white"
                              }`}
                              onClick={() => handleSelect(qty)}
                              onMouseEnter={() => setHoverQty(qty)}>
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
              <div className="w-full flex flex-col gap-4 sm:gap-5">
                {/* Add to Cart Button */}
                <div className="w-full">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || !selectedSize || (selectedSize && sizes.find((s) => s.size === selectedSize)?.stock === 0)}
                    className="w-full border py-4 sm:py-5 px-4 sm:px-6 flex items-center justify-center bg-[#191919] text-white text-base sm:text-lg md:text-xl font-bold rounded-md cursor-pointer transition duration-300 hover:bg-[#3b4047] min-h-[50px] sm:min-h-[60px] disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label={isOutOfStock ? "Product is out of stock" : "Add to cart"}
                    data-testid="add-to-cart-btn">
                    {isOutOfStock 
                      ? "OUT OF STOCK" 
                      : !selectedSize 
                      ? "SELECT SIZE" 
                      : "ADD TO CART"}
                  </button>
                </div>

                {/* Add to Wishlist Button */}
                <div className="w-full">
                  <button
                    onClick={handleWishlistToggle}
                    className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-5 border py-4 sm:py-5 px-4 sm:px-6 cursor-pointer hover:bg-gray-100 transition duration-300 rounded-md min-h-[50px] sm:min-h-[60px] focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    data-testid="wishlist-btn">
                    <span className="text-2xl sm:text-3xl">
                      {inWishlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    </span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-center">
                      {inWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full gap-1">
              <div className="flex gap-2 items-center font-bold text-[#6d9532] text-[17px]">
                <div>
                  <FaTruckFast />
                </div>
                <div>This item qualifies for free shipping!</div>
              </div>
              <div className="flex gap-2 items-center font-bold text-[#80858c] text-[17px]">
                <div>
                  <FaArrowRotateRight />
                </div>
                <div>Free returns on all qualifying orders.</div>
              </div>
            </div>

            <div className="border-b border-[#dfe0e1]"></div>

            <div className="flex flex-col gap-3">
              <div className="font-bold text-[16px]">Check Delivery Availability</div>
              <div className="text-[14px] text-gray-600">Please enter PIN code to check delivery time</div>

              <div className="flex flex-col gap-2 w-full">
                <label className="font-bold text-sm md:text-base">PIN CODE</label>
                <div className="flex flex-col sm:flex-row w-full gap-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit PIN code"
                    value={pinCode}
                    onChange={handlePinCodeChange}
                    onKeyPress={handlePinCodeKeyPress}
                    maxLength={6}
                    className="w-full h-10 px-4 border border-gray-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-text"
                    aria-label="Enter PIN code"
                  />
                  <div className="flex justify-end w-full sm:w-auto">
                    <button
                      onClick={checkDelivery}
                      disabled={pinCode.length !== 6 || checkingDelivery}
                      className="h-10 px-6 bg-black font-bold text-white text-sm rounded-sm cursor-pointer hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                      aria-label="Check delivery">
                      {checkingDelivery ? "CHECKING..." : "CHECK"}
                    </button>
                  </div>
                </div>

                {deliveryInfo && (
                  <div className={`mt-3 p-4 rounded-md border ${
                    deliveryInfo.error 
                      ? "bg-red-50 border-red-200" 
                      : "bg-green-50 border-green-200"
                  }`}>
                    {deliveryInfo.error ? (
                      <div className="text-red-700 text-sm font-semibold">
                        {deliveryInfo.error}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="text-green-700 font-bold text-sm">✓</div>
                          <div className="text-green-700 font-semibold text-sm">
                            Delivery available to {deliveryInfo.pinCode}
                          </div>
                        </div>
                        <div className="text-gray-700 text-sm">
                          <div className="font-semibold mb-1">Expected Delivery:</div>
                          <div className="text-[15px] font-bold text-black">
                            {deliveryInfo.deliveryDate}
                          </div>
                          <div className="text-gray-600 mt-1">
                            ({deliveryInfo.deliveryTime})
                          </div>
                        </div>
                        {deliveryInfo.charges === 0 ? (
                          <div className="text-green-700 text-sm font-semibold mt-1">
                            Free shipping available
                          </div>
                        ) : (
                          <div className="text-gray-700 text-sm font-semibold mt-1">
                            Shipping charges: ₹{deliveryInfo.charges}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-[#dfe0e1]"></div>

            <div className="flex flex-col gap-2">
              <div className="font-bold text-[18px]">Description</div>
              <ReadMore
                text="The PUMA Easy Rider was born in the late '70s, when running made its move from the track to the streets. Today it's back with a modern twist, featuring premium materials and contemporary design. This iconic sneaker combines retro style with modern comfort, making it perfect for everyday wear. The cushioned insole provides all-day comfort, while the durable outsole ensures long-lasting performance."
                maxLength={150}
                className="text-[16px] text-[#191919c1]"
              />
              <div>
                <ul className="list-disc pl-5">
                  <li>Style: {product?.styleNumber || "399029_02"}</li>
                  <li>Color: {selectedColor?.colorName || product?.color || "PUMA White-Frosted Ivory"}</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="text-xl font-bold">Shipping and Returns</div>
              <div className="text-[16px] font-normal text-[#191919]">
                Free return on all qualifying orders within 14 days of your
                order delivery date. Visit our{" "}
                <span className="border-b-2 leading-5 cursor-pointer border-[#95a9ba] hover:border-[#d1c3af]">
                  Return Policy
                </span>{" "}
                for more information.
              </div>
              <div className="text-[16px] font-normal text-[#191919]">
                For any queries, please contact Customer Service on email at{" "}
                <span className="border-b-2 leading-5 cursor-pointer border-[#95a9ba] hover:border-[#d1c3af]">
                  customercareindia@puma.com
                </span>{" "}
                , or send us a "Hi" on Whatsapp at 6364929121.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 my-5">
        <div className="text-2xl font-bold">SEE SIMILAR</div>
        <div>
          <Swipers />
        </div>
      </div>
      <div>
        <ProductStory />
      </div>

      {/* Size Guide Modal */}
      <Dialog
        open={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        maxWidth="md"
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
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(2px)",
            },
          },
        }}>
        <DialogTitle className="flex items-center justify-between border-b pb-4">
          <div className="text-2xl font-bold flex items-center gap-2">
            <RiRulerLine className="text-2xl" />
            Size Guide
          </div>
          <button
            onClick={() => setShowSizeGuide(false)}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close size guide">
            <RxCross2 className="text-2xl" />
          </button>
        </DialogTitle>
        <DialogContent className="p-6">
          <div className="flex flex-col gap-6">
            {/* How to Measure Section */}
            <div>
              <h3 className="text-xl font-bold mb-3">How to Measure Your Foot</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex gap-3">
                  <div className="font-semibold">1.</div>
                  <div>Place your foot on a flat surface with your heel against a wall.</div>
                </div>
                <div className="flex gap-3">
                  <div className="font-semibold">2.</div>
                  <div>Measure from the wall to the tip of your longest toe.</div>
                </div>
                <div className="flex gap-3">
                  <div className="font-semibold">3.</div>
                  <div>Measure both feet and use the larger measurement.</div>
                </div>
                <div className="flex gap-3">
                  <div className="font-semibold">4.</div>
                  <div>Refer to the size chart below to find your perfect fit.</div>
                </div>
              </div>
            </div>

            {/* Size Chart Table */}
            <div>
              <h3 className="text-xl font-bold mb-3">UK Size Chart</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">UK Size</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">EU Size</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">US Size</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 5</td>
                      <td className="border border-gray-300 px-4 py-2">38</td>
                      <td className="border border-gray-300 px-4 py-2">6</td>
                      <td className="border border-gray-300 px-4 py-2">24.0 - 24.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 6</td>
                      <td className="border border-gray-300 px-4 py-2">39</td>
                      <td className="border border-gray-300 px-4 py-2">7</td>
                      <td className="border border-gray-300 px-4 py-2">24.5 - 25.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 7</td>
                      <td className="border border-gray-300 px-4 py-2">40</td>
                      <td className="border border-gray-300 px-4 py-2">8</td>
                      <td className="border border-gray-300 px-4 py-2">25.0 - 25.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 8</td>
                      <td className="border border-gray-300 px-4 py-2">41</td>
                      <td className="border border-gray-300 px-4 py-2">9</td>
                      <td className="border border-gray-300 px-4 py-2">25.5 - 26.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 9</td>
                      <td className="border border-gray-300 px-4 py-2">42</td>
                      <td className="border border-gray-300 px-4 py-2">10</td>
                      <td className="border border-gray-300 px-4 py-2">26.0 - 26.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 10</td>
                      <td className="border border-gray-300 px-4 py-2">43</td>
                      <td className="border border-gray-300 px-4 py-2">11</td>
                      <td className="border border-gray-300 px-4 py-2">26.5 - 27.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 11</td>
                      <td className="border border-gray-300 px-4 py-2">44</td>
                      <td className="border border-gray-300 px-4 py-2">12</td>
                      <td className="border border-gray-300 px-4 py-2">27.0 - 27.5</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 12</td>
                      <td className="border border-gray-300 px-4 py-2">45</td>
                      <td className="border border-gray-300 px-4 py-2">13</td>
                      <td className="border border-gray-300 px-4 py-2">27.5 - 28.0</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">UK 13</td>
                      <td className="border border-gray-300 px-4 py-2">46</td>
                      <td className="border border-gray-300 px-4 py-2">14</td>
                      <td className="border border-gray-300 px-4 py-2">28.0 - 28.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fit Tips */}
            <div>
              <h3 className="text-xl font-bold mb-3">Fit Tips</h3>
              <ul className="space-y-2 text-gray-700 list-disc list-inside">
                <li>Leave about a thumb's width (1cm) of space between your longest toe and the end of the shoe.</li>
                <li>Your heel should fit snugly without slipping.</li>
                <li>Walk around to ensure the shoe feels comfortable and secure.</li>
                <li>If you're between sizes, we recommend going up a half size.</li>
                <li>Different shoe styles may fit differently - check product-specific fit notes.</li>
              </ul>
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Sizes may vary slightly between different shoe models. 
                If you're unsure about your size, we recommend visiting a PUMA store for a professional fitting.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
