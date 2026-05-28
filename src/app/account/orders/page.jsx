"use client";

import { NavigationDatass } from "@/constant/ProductsDerails/NavigationDatas";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaTruck, FaCheckCircle, FaTimesCircle, FaUndo, FaBoxOpen, FaBox, FaShippingFast } from "react-icons/fa";
import Image from "next/image";
import { filterOrdersByPeriod } from "@/utils/orderStorage";
import { formatPrice } from "@/utils/price";
import { useToast } from "@/context/toaster";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { ordersApi } from "@/mocks/orders";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Page = () => {
    const router = useRouter();
    const path = usePathname();
  const { setAlert } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showTracking, setShowTracking] = useState({});
  const [returnReason, setReturnReason] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("shopTheme") || "light";
        setIsDark(stored === "dark");
      }
    };
    checkTheme();
    const interval = setInterval(checkTheme, 300);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeStyles = (status) => {
    if (isDark) {
      switch (status) {
        case "delivered":
          return "text-green-400 bg-green-950/20 border-green-900/30";
        case "shipped":
          return "text-blue-400 bg-blue-950/20 border-blue-900/30";
        case "cancelled":
          return "text-red-400 bg-red-950/20 border-red-900/30";
        case "returned":
          return "text-orange-400 bg-orange-950/20 border-orange-900/30";
        case "return_initiated":
          return "text-yellow-400 bg-yellow-950/20 border-yellow-900/30";
        default:
          return "text-gray-400 bg-gray-900/20 border-gray-800/30";
      }
    } else {
      switch (status) {
        case "delivered":
          return "text-green-600 bg-green-50 border-green-200";
        case "shipped":
          return "text-blue-600 bg-blue-50 border-blue-200";
        case "cancelled":
          return "text-red-600 bg-red-50 border-red-200";
        case "returned":
          return "text-orange-600 bg-orange-50 border-orange-200";
        case "return_initiated":
          return "text-yellow-600 bg-yellow-50 border-yellow-200";
        default:
          return "text-gray-600 bg-gray-50 border-gray-200";
      }
    }
  };

  const { data: dbOrders = [], isLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await ordersApi.getMyOrders();
      return res.data?.status === "SUCCESS" ? res.data.data : [];
    }
  });

  const orders = useMemo(() => {
    return dbOrders.map(order => ({
      orderId: order._id,
      orderDate: order.createdAt,
      orderTotal: order.totalAmount,
      subtotal: order.totalAmount,
      totalDiscount: 0,
      shippingCharges: 0,
      status: order.status ? order.status.toLowerCase() : "pending",
      estimatedDelivery: new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      items: order.items.map(item => ({
        name: item.name,
        image: item.img || "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg",
        size: item.size || "One Size",
        quantity: item.quantity || 1,
        unitPrice: item.price || 0,
        basePrice: item.price || 0,
        discountAmount: 0
      })),
      shippingAddress: {
        firstName: order.shippingAddress?.fullName?.split(" ")[0] || "Customer",
        lastName: order.shippingAddress?.fullName?.split(" ").slice(1).join(" ") || "",
        addressLine1: order.shippingAddress?.addressLine || "",
        addressLine2: "",
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        pinCode: order.shippingAddress?.postalCode || "",
        country: order.shippingAddress?.country || "India"
      }
    }));
  }, [dbOrders]);

  const filteredOrders = useMemo(() => {
    if (selectedPeriod === "all") return orders;
    return filterOrdersByPeriod(orders, selectedPeriod);
  }, [orders, selectedPeriod]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="text-green-600" />;
      case "shipped":
        return <FaTruck className="text-blue-600" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-600" />;
      case "returned":
        return <FaUndo className="text-orange-600" />;
      case "return_initiated":
        return <FaUndo className="text-yellow-600" />;
      default:
        return <FaBoxOpen className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "shipped":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      case "returned":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "return_initiated":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDeliveryDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Delivered";
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  // Order tracking steps
  const getOrderTrackingSteps = (order) => {
    const steps = [
      {
        id: "confirmed",
        label: "Order Confirmed",
        icon: FaCheckCircle,
        completed: true,
        date: order.orderDate,
      },
      {
        id: "shipped",
        label: "Shipped",
        icon: FaTruck,
        completed: ["shipped", "out_for_delivery", "delivered"].includes(order.status),
        date: order.shippedAt || (order.status === "shipped" ? new Date().toISOString() : null),
      },
      {
        id: "out_for_delivery",
        label: "Out for Delivery",
        icon: FaShippingFast,
        completed: ["out_for_delivery", "delivered"].includes(order.status),
        date: order.outForDeliveryAt || (order.status === "out_for_delivery" ? new Date().toISOString() : null),
      },
      {
        id: "delivered",
        label: "Delivered",
        icon: FaBoxOpen,
        completed: order.status === "delivered",
        date: order.deliveredAt || (order.status === "delivered" ? new Date().toISOString() : null),
      },
    ];

    // Determine current active step
    let currentStepIndex = 0;
    if (order.status === "delivered") {
      currentStepIndex = 3;
    } else if (order.status === "out_for_delivery") {
      currentStepIndex = 2;
    } else if (order.status === "shipped") {
      currentStepIndex = 1;
    } else {
      currentStepIndex = 0;
    }

    return { steps, currentStepIndex };
  };

  const OrderTracking = ({ order }) => {
    const { steps, currentStepIndex } = getOrderTrackingSteps(order);

    if (order.status === "cancelled" || order.status === "returned" || order.status === "return_initiated") {
      return null; // Don't show tracking for cancelled/returned orders
    }

    return (
      <div className="mt-5 pt-5 border-t border-gray-200">
        <h3 className="font-bold mb-4 text-lg">Order Tracking</h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
            <div
              className="absolute top-0 left-0 w-full bg-green-500 transition-all duration-500"
              style={{
                height: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = step.completed;
              const isPending = index > currentStepIndex;

              return (
                <div key={step.id} className="flex items-start gap-4 relative">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}>
                    <StepIcon className="text-sm" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div
                      className={`font-semibold text-sm ${
                        isCompleted || isActive ? "text-gray-900" : "text-gray-400"
                      }`}>
                      {step.label}
                    </div>
                    {step.date && (isCompleted || isActive) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(step.date)}
                        {isActive && !isCompleted && (
                          <span className="ml-2 text-blue-600 font-semibold">(In Progress)</span>
                        )}
                      </div>
                    )}
                    {!step.date && isPending && (
                      <div className="text-xs text-gray-400 mt-1">Pending</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleInitiateReturn = (orderId) => {
    setShowReturnModal(orderId);
  };

  const handleReturnSubmit = (orderId) => {
    if (!returnReason.trim()) {
      setAlert({
        open: true,
        message: "Please select a return reason",
        severity: "error",
      });
      return;
    }

    updateOrderStatus(orderId, "return_initiated", {
      returnReason,
      returnInitiatedAt: new Date().toISOString(),
    });

    setOrders(getOrdersFromStorage());
    setShowReturnModal(null);
    setReturnReason("");

    setAlert({
      open: true,
      message: "Return request initiated successfully. Our team will contact you soon.",
      severity: "success",
    });
  };

  const handleCancelOrder = (orderId) => {
    setShowCancelConfirm(orderId);
  };

  const confirmCancelOrder = async (orderId) => {
    try {
      const res = await ordersApi.cancelOrder(orderId);
      if (res.data?.status === "SUCCESS") {
        queryClient.invalidateQueries({ queryKey: ["myOrders"] });
        setAlert({
          open: true,
          message: "Order cancelled successfully",
          severity: "success",
        });
      } else {
        setAlert({
          open: true,
          message: res.data?.message || "Failed to cancel order",
          severity: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        open: true,
        message: "Failed to cancel order",
        severity: "error",
      });
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0c0c0e] text-white" : "bg-gray-50 text-black"}`}>
      <div className="lg:w-[90%] w-[95%] m-auto flex flex-col my-10 gap-5">
        {/* Breadcrumb */}
      <div className={`w-full ${isDark ? "text-gray-300" : "text-black"}`}>
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
          <span className="font-normal">{path.split("/").pop()}</span>
    </div>

        {/* Header */}
        <div className="flex flex-col gap-2 pb-5">
          <div className="text-2xl font-bold">My Orders</div>
          <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            View and manage all your orders
          </div>
        </div>

        {/* Filter */}
        <div className={`flex flex-col gap-1 p-4 rounded-lg shadow-sm border ${
          isDark ? "bg-[#121215] border-[#1f1f24]" : "bg-white border-gray-100"
        }`}>
          <div className={`text-[12px] font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>SELECT DATE</div>
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`border p-4 w-full appearance-none cursor-pointer focus:outline-none focus:ring-2 rounded ${
                isDark 
                  ? "bg-[#18181b] border-[#27272a] text-white focus:ring-gray-700" 
                  : "bg-white border-gray-300 text-black focus:ring-gray-400"
              }`}>
              <option value="all">All Orders</option>
              <option value="last-six-months">Last six months</option>
              <option value="last-twelve-months">Last twelve months</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <IoIosArrowDown />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className={`p-10 rounded-lg shadow-sm text-center border ${
            isDark ? "bg-[#121215] border-[#1f1f24]" : "bg-white border-gray-100"
          }`}>
            <div className="text-xl font-bold mb-2">No orders found</div>
            <div className={`mb-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {selectedPeriod === "all"
                ? "You haven't placed any orders yet."
                : "No orders found for the selected time period."}
            </div>
            <Link
              href="/products/footwear"
              className={`inline-block px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-lg text-center cursor-pointer ${
                isDark 
                  ? "bg-white text-black hover:bg-red-600 hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]" 
                  : "bg-black text-white hover:bg-red-600 hover:text-white"
              }`}>
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className={`rounded-lg shadow-sm border overflow-hidden ${
                  isDark ? "bg-[#121215] border-[#1f1f24]" : "bg-white border-gray-200"
                }`}>
                {/* Order Header */}
                <div className={`p-5 border-b ${isDark ? "border-[#1f1f24]" : "border-gray-200"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Order #{order.orderId}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                            getStatusBadgeStyles(order.status)
                          }`}>
                          {getStatusIcon(order.status)}
                          {order.status.toUpperCase().replace("_", " ")}
                        </span>
                      </div>                    </div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Placed on {formatDate(order.orderDate)}
                    </div>
                  </div>
                  <div className="flex flex-col sm:text-right gap-1">
                    <div className="font-bold text-lg">
                      {formatPrice(order.orderTotal)}
                    </div>
                    {order.status !== "cancelled" && order.status !== "returned" && (
                      <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {order.status === "delivered" ? (
                          <span className="text-green-600 font-semibold">
                            Delivered on {formatDate(order.deliveredAt || order.estimatedDelivery)}
                          </span>
                        ) : (
                          <span>
                            Expected delivery:{" "}
                            <span className="font-semibold text-blue-600">
                              {formatDeliveryDate(order.estimatedDelivery)}
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              {/* Order Items */}
              <div className="p-5">
                <div className="flex flex-col gap-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 pb-4 border-b last:border-0 ${
                        isDark ? "border-[#1f1f24]" : "border-gray-100"
                      }`}>
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-contain rounded"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="font-semibold text-sm sm:text-base">
                          {item.name}
                        </div>
                        <div className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Size: {item.size} | Qty: {item.quantity}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-sm sm:text-base">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                          {item.discountAmount > 0 && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(item.basePrice * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className={`flex flex-wrap gap-3 mt-5 pt-5 border-t ${isDark ? "border-[#1f1f24]" : "border-gray-200"}`}>
                  {order.status === "ordered" && (
                    <>
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className={`px-4 py-2 border rounded font-semibold text-sm cursor-pointer transition-colors ${
                          isDark 
                            ? "bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border-[#27272a]" 
                            : "border-gray-300 hover:bg-gray-50 text-black"
                        }`}>
                        Cancel Order
                      </button>
                    </>
                  )}
                  {(order.status === "delivered" || order.status === "shipped") && (
                    <button
                      onClick={() => handleInitiateReturn(order.orderId)}
                      className={`px-4 py-2 border rounded font-semibold text-sm cursor-pointer transition-colors ${
                        isDark 
                          ? "bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border-[#27272a]" 
                          : "border-gray-300 hover:bg-gray-50 text-black"
                      }`}>
                      Initiate Return
                    </button>
                  )}
                  {order.status === "return_initiated" && (
                    <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      Return request submitted. Processing...
                    </div>
                  )}
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.orderId ? null : order.orderId
                      )
                    }
                    className={`px-4 py-2 border rounded font-semibold text-sm cursor-pointer transition-colors ${
                      isDark 
                        ? "bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border-[#27272a]" 
                        : "border-gray-300 hover:bg-gray-50 text-black"
                    }`}>
                    {expandedOrder === order.orderId
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </div>

                {/* View Details - Shows directly below button */}
                {expandedOrder === order.orderId && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="font-bold mb-2">Shipping Address</h3>
                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {order.shippingAddress.firstName}{" "}
                          {order.shippingAddress.lastName}
                          <br />
                          {order.shippingAddress.addressLine1}
                          {order.shippingAddress.addressLine2 && (
                            <>
                              <br />
                              {order.shippingAddress.addressLine2}
                            </>
                          )}
                          <br />
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                          <br />
                          {order.shippingAddress.pinCode}
                          <br />
                          {order.shippingAddress.country}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">Order Summary</h3>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Subtotal:</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          {order.totalDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-{formatPrice(order.totalDiscount)}</span>
                            </div>
                          )}
                          {order.shippingCharges > 0 && (
                            <div className="flex justify-between">
                              <span className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Shipping:</span>
                              <span>{formatPrice(order.shippingCharges)}</span>
                            </div>
                          )}
                          <div className={`flex justify-between font-bold pt-2 border-t ${isDark ? "border-[#1f1f24]" : ""}`}>
                            <span>Total:</span>
                            <span>{formatPrice(order.orderTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Tracking Button - Only for active orders */}
                {order.status !== "cancelled" && order.status !== "returned" && order.status !== "return_initiated" && (
                  <div className={`mt-5 pt-5 border-t ${isDark ? "border-[#1f1f24]" : "border-gray-200"}`}>
                    <button
                      onClick={() =>
                        setShowTracking((prev) => ({
                          ...prev,
                          [order.orderId]: !prev[order.orderId],
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2 border rounded font-semibold text-sm cursor-pointer transition-colors ${
                        isDark 
                          ? "bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border-[#27272a]" 
                          : "border-gray-300 hover:bg-gray-50 text-black"
                      }`}>
                      <FaTruck className="text-blue-600" />
                      {showTracking[order.orderId] ? "Hide Tracking" : "Track Order"}
                    </button>
                    {showTracking[order.orderId] && (
                      <div className="mt-4">
                        <OrderTracking order={order} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <ConfirmationModal
        open={showCancelConfirm !== null}
        onClose={() => setShowCancelConfirm(null)}
        onConfirm={() => confirmCancelOrder(showCancelConfirm)}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        type="danger"
      />

      {/* Return Modal */}
      {showReturnModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(2px)' }}>
          <div className={`rounded-lg max-w-md w-full shadow-2xl border ${
            isDark ? "bg-[#121215] border-[#1f1f24] text-white" : "bg-white border-gray-200 text-black"
          }`}>
            <div className={`p-6 border-b ${isDark ? "border-[#1f1f24]" : "border-gray-200"}`}>
              <h2 className="text-xl font-bold">Initiate Return</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className={`w-full border p-3 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 ${
                    isDark ? "bg-[#18181b] border-[#27272a] text-white" : "border-gray-300 text-black"
                  }`}>
                  <option value="">Select a reason</option>
                  <option value="defective">Defective/Damaged Product</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="size_issue">Size Issue</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="not_as_described">Not as Described</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className={`p-6 border-t flex gap-3 ${isDark ? "border-[#1f1f24]" : "border-gray-200"}`}>
              <button
                onClick={() => {
                  setShowReturnModal(null);
                  setReturnReason("");
                }}
                className={`flex-1 px-4 py-2 border rounded font-semibold cursor-pointer transition-colors ${
                  isDark 
                    ? "bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border-[#27272a]" 
                    : "border-gray-300 hover:bg-gray-50 text-black"
                }`}>
                Cancel
              </button>
              <button
                onClick={() => handleReturnSubmit(showReturnModal)}
                className={`flex-1 px-4 py-2 rounded font-semibold cursor-pointer transition-colors ${
                  isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                }`}>
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default Page;
