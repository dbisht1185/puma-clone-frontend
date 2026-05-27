"use client";

import { NavigationDatass } from "@/constant/ProductsDerails/NavigationDatas";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaTruck, FaCheckCircle, FaTimesCircle, FaUndo, FaBoxOpen, FaBox, FaShippingFast } from "react-icons/fa";
import Image from "next/image";
import { getOrdersFromStorage, filterOrdersByPeriod, updateOrderStatus, simulateOrderProgression } from "@/utils/orderStorage";
import { formatPrice } from "@/utils/price";
import { useToast } from "@/context/toaster";
import ConfirmationModal from "@/components/common/ConfirmationModal";

const Page = () => {
    const router = useRouter();
    const path = usePathname();
  const { setAlert } = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showTracking, setShowTracking] = useState({});
  const [returnReason, setReturnReason] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  useEffect(() => {
    // Simulate order progression (auto-update order statuses)
    simulateOrderProgression();
    const storedOrders = getOrdersFromStorage();
    setOrders(storedOrders);

    // Refresh orders every minute to update tracking
    const interval = setInterval(() => {
      simulateOrderProgression();
      const updatedOrders = getOrdersFromStorage();
      setOrders(updatedOrders);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

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

  const confirmCancelOrder = (orderId) => {
    updateOrderStatus(orderId, "cancelled", {
      cancelledAt: new Date().toISOString(),
    });

    setOrders(getOrdersFromStorage());

    setAlert({
      open: true,
      message: "Order cancelled successfully",
      severity: "success",
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="lg:w-[90%] w-[95%] m-auto flex flex-col my-10 gap-5">
        {/* Breadcrumb */}
      <div className="w-full text-black">
          <Link href="/" className="font-bold cursor-pointer">
            Home
          </Link>
      <span className="mx-1 text-gray-500"> • </span>
          <Link href="/account" className="font-bold cursor-pointer">
            My account
          </Link>
      <span className="mx-1 text-gray-500"> • </span>
          <span className="font-normal">{path.split("/").pop()}</span>
    </div>

        {/* Header */}
        <div className="flex flex-col gap-2 pb-5">
          <div className="text-2xl font-bold">My Orders</div>
          <div className="text-sm text-gray-600">
            View and manage all your orders
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-1 bg-white p-4 rounded-lg shadow-sm">
          <div className="text-[12px] font-bold text-gray-700">SELECT DATE</div>
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border p-4 w-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 rounded">
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
          <div className="bg-white p-10 rounded-lg shadow-sm text-center">
            <div className="text-xl font-bold mb-2">No orders found</div>
            <div className="text-gray-600 mb-5">
              {selectedPeriod === "all"
                ? "You haven't placed any orders yet."
                : "No orders found for the selected time period."}
            </div>
            <Link
              href="/products/footwear"
              className="inline-block px-6 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 cursor-pointer transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-5 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Order #{order.orderId}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(
                            order.status
                          )}`}>
                          {getStatusIcon(order.status)}
                          {order.status.toUpperCase().replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Placed on {formatDate(order.orderDate)}
                      </div>
                    </div>
                    <div className="flex flex-col sm:text-right gap-1">
                      <div className="font-bold text-lg">
                        {formatPrice(order.orderTotal)}
                      </div>
                      {order.status !== "cancelled" && order.status !== "returned" && (
                        <div className="text-sm text-gray-600">
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
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="flex flex-col gap-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
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
                          <div className="text-xs sm:text-sm text-gray-600">
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
                  <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-200">
                    {order.status === "ordered" && (
                      <>
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-semibold text-sm cursor-pointer transition-colors">
                          Cancel Order
                        </button>
                      </>
                    )}
                    {(order.status === "delivered" || order.status === "shipped") && (
                      <button
                        onClick={() => handleInitiateReturn(order.orderId)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-semibold text-sm cursor-pointer transition-colors">
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
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-semibold text-sm cursor-pointer transition-colors">
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
                          <div className="text-sm text-gray-600">
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
                              <span className="text-gray-600">Subtotal:</span>
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
                                <span className="text-gray-600">Shipping:</span>
                                <span>{formatPrice(order.shippingCharges)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold pt-2 border-t">
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
                    <div className={`${expandedOrder === order.orderId ? "mt-5 pt-5 border-t border-gray-200" : "mt-5 pt-5 border-t border-gray-200"}`}>
                      <button
                        onClick={() =>
                          setShowTracking((prev) => ({
                            ...prev,
                            [order.orderId]: !prev[order.orderId],
                          }))
                        }
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-semibold text-sm cursor-pointer transition-colors">
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
            className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4"
            style={{ backdropFilter: 'blur(2px)' }}>
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
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
                    className="w-full border p-3 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400">
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
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowReturnModal(null);
                    setReturnReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-semibold cursor-pointer transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleReturnSubmit(showReturnModal)}
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 font-semibold cursor-pointer transition-colors">
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
