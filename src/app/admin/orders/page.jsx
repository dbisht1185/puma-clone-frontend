"use client";

import { useEffect, useState, useMemo } from "react";
import { debounce } from "@/utils/debounce";
import { ordersApi } from "@/mocks/orders";
import AdminGuard from "../AdminGuard";
import { FiEye, FiCheck, FiShoppingBag, FiTruck, FiX } from "react-icons/fi";
import { useToast } from "@/context/toaster";
import { useAdminTheme } from "../layout";

export default function AdminOrdersPage() {
  const { theme } = useAdminTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchDebounced = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    handleSearchDebounced(value);
  };
  const [selectedOrder, setSelectedOrder] = useState(null); // Modal for viewing order items

  const toastContext = useToast();
  const setAlert = toastContext?.setAlert;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAllOrders({ q: debouncedSearch });
      if (res.data?.status === "SUCCESS") {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: "Failed to load orders list from server",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await ordersApi.updateOrderStatus(orderId, newStatus);

      if (res.data?.status === "SUCCESS") {
        setAlert?.({
          open: true,
          message: `Order status successfully updated to ${newStatus}!`,
          severity: "success",
        });
        
        // Refresh local items
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: "Failed to update order status.",
        severity: "error",
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "ALL") return true;
    return order.status?.toUpperCase() === statusFilter;
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className={`flex flex-col lg:flex-row gap-4 justify-between items-center border p-4 rounded-xl transition-all duration-200 ${
          theme === "dark" ? "bg-[#0c0c0e] border-[#1a1a1f]" : "bg-white border-gray-200 shadow-sm"
        }`}>
          {/* Search Field */}
          <div className="relative w-full lg:max-w-xs flex items-center">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by ID, name or phone..."
              className={`w-full px-4 pr-10 py-2 border rounded-lg text-xs font-semibold focus:outline-none focus:border-red-600 transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-[#131317] border-[#23232a] text-white hover:border-[#333]"
                  : "bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300"
              }`}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                }}
                className={`absolute right-3 p-1 rounded-full transition-colors ${
                  theme === "dark" ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <FiX size={14} />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
            {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  statusFilter === filter
                    ? "bg-red-600 text-white shadow-md shadow-red-900/10"
                    : theme === "dark"
                      ? "bg-[#131317] border border-[#23232a] text-gray-400 hover:text-white"
                      : "bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${
          theme === "dark" ? "bg-[#0c0c0e] border-[#1a1a1f]" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b transition-colors duration-200 ${
                  theme === "dark" ? "border-[#1a1a1f] text-gray-500" : "border-gray-200 text-gray-400"
                } text-[10px] uppercase tracking-widest font-bold font-sans`}>
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Date Placed</th>
                  <th className="p-4">Shipping Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-200 ${
                theme === "dark" ? "divide-[#1a1a1f] text-gray-300" : "divide-gray-200 text-gray-600"
              } text-xs font-semibold`}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className={`w-8 h-8 border-4 border-t-red-600 rounded-full animate-spin inline-block ${
                        theme === "dark" ? "border-[#333]" : "border-gray-200"
                      }`}></div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 uppercase tracking-widest text-[10px]">
                      No orders found under this classification.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    return (
                      <tr key={order._id} className={`transition-all group ${
                        theme === "dark" ? "hover:bg-[#121215]/40" : "hover:bg-gray-50/50"
                      }`}>
                        {/* ID */}
                        <td className={`p-4 pl-6 font-mono transition-colors duration-200 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} text-xs`}>
                          #{order._id.toString().slice(-8).toUpperCase()}
                        </td>

                        {/* Customer */}
                        <td className={`p-4 transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-950"}`}>
                          {order.shippingAddress?.fullName || order.user?.name || "Puma customer"}
                        </td>

                        {/* Total */}
                        <td className={`p-4 font-bold transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-955"} text-sm`}>
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </td>

                        {/* Date */}
                        <td className={`p-4 font-sans transition-colors duration-200 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </td>

                        {/* Status Select dropdown */}
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider border focus:outline-none cursor-pointer transition-colors duration-200 ${
                              theme === "dark" ? "bg-[#131317] border-[#23232a]" : "bg-white border-gray-300"
                            } ${
                              order.status === "Delivered"
                                ? "text-green-500 border-green-500/30"
                                : order.status === "Pending"
                                ? "text-yellow-500 border-yellow-500/30"
                                : order.status === "Shipped"
                                ? "text-blue-500 border-blue-500/30"
                                : order.status === "Processing"
                                ? "text-purple-500 border-purple-500/30"
                                : "text-red-500 border-red-500/30"
                            }`}
                          >
                            <option value="Pending" className="text-yellow-500">PENDING</option>
                            <option value="Processing" className="text-purple-500">PROCESSING</option>
                            <option value="Shipped" className="text-blue-500">SHIPPED</option>
                            <option value="Delivered" className="text-green-500">DELIVERED</option>
                            <option value="Cancelled" className="text-red-500">CANCELLED</option>
                          </select>
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`p-2 border rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                              theme === "dark"
                                ? "bg-[#131317] border-[#23232a] text-gray-400 hover:text-white hover:border-[#3a3a45]"
                                : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                            }`}
                          >
                            <FiEye />
                            <span>INSPECT</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ORDER DETAILS INSPECTOR MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-slideIn transition-colors duration-200 ${
              theme === "dark" ? "bg-[#0c0c0e] border-[#1d1d22] text-gray-200" : "bg-white border-gray-200 text-gray-700"
            }`}>
              {/* Header */}
              <div className={`h-16 border-b flex justify-between items-center px-6 transition-colors duration-200 ${
                theme === "dark" ? "border-[#1a1a1f] bg-[#0f0f11]" : "border-gray-200 bg-gray-50"
              }`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  <FiShoppingBag className="text-red-500" />
                  Order #{selectedOrder._id.toString().slice(-8).toUpperCase()}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={`text-lg cursor-pointer transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <FiX />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Customer Info */}
                  <div className="space-y-4">
                    <h4 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 transition-colors ${
                      theme === "dark" ? "text-gray-400 border-[#1a1a1f]" : "text-gray-500 border-gray-200"
                    }`}>
                      Shipping Details
                    </h4>
                    <div className="space-y-2 text-xs">
                      <p><strong className="text-gray-500">FullName:</strong> {selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}</p>
                      <p><strong className="text-gray-500">Address:</strong> {selectedOrder.shippingAddress?.addressLine || "No Address Line"}</p>
                      <p><strong className="text-gray-500">City / ZIP:</strong> {selectedOrder.shippingAddress?.city || "N/A"} - {selectedOrder.shippingAddress?.postalCode || "N/A"}</p>
                      <p><strong className="text-gray-500">Mobile Phone:</strong> {selectedOrder.shippingAddress?.phone || "N/A"}</p>
                    </div>
                  </div>

                  {/* Right: Tracking Status */}
                  <div className="space-y-4">
                    <h4 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 transition-colors ${
                      theme === "dark" ? "text-gray-400 border-[#1a1a1f]" : "text-gray-500 border-gray-200"
                    }`}>
                      Tracking Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-bold uppercase">Status:</span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          selectedOrder.status === "Delivered"
                            ? theme === "dark"
                              ? "bg-green-950/20 text-green-400 border-green-900/30"
                              : "bg-green-50 text-green-600 border-green-200"
                            : selectedOrder.status === "Pending"
                            ? theme === "dark"
                              ? "bg-yellow-950/20 text-yellow-400 border-yellow-900/30"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : selectedOrder.status === "Shipped"
                            ? theme === "dark"
                              ? "bg-blue-950/20 text-blue-400 border-blue-900/30"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                            : theme === "dark"
                              ? "bg-red-950/20 text-red-400 border-red-900/30"
                              : "bg-red-50 text-red-600 border-red-200"
                        }`}>
                          {selectedOrder.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Modify Status:</span>
                        <div className="flex flex-wrap gap-2">
                          {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(selectedOrder._id, st)}
                              className={`px-2.5 py-1.5 text-[9px] font-extrabold uppercase rounded-lg border transition-all cursor-pointer ${
                                selectedOrder.status === st
                                  ? "bg-red-600 border-red-600 text-white shadow-sm"
                                  : theme === "dark"
                                    ? "bg-[#131317] border-[#23232a] text-gray-400 hover:text-white"
                                    : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              {st.slice(0, 4)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  <h4 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 transition-colors ${
                    theme === "dark" ? "text-gray-400 border-[#1a1a1f]" : "text-gray-500 border-gray-200"
                  }`}>
                    Itemized Breakdown ({selectedOrder.items?.length || 0} Units)
                  </h4>
                  <div className={`divide-y border rounded-lg overflow-hidden transition-all duration-200 ${
                    theme === "dark" ? "divide-[#1a1a1f] bg-[#121215]/30 border-[#1d1d22]" : "divide-gray-200 bg-gray-50/50 border-gray-200"
                  }`}>
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-4 text-xs font-semibold transition-colors duration-200 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded border overflow-hidden flex items-center justify-center shrink-0 transition-colors duration-200 ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a]" : "bg-white border-gray-200"
                          }`}>
                            <img
                              src={item.img || "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg"}
                              alt={item.name}
                              className="object-contain w-8 h-8"
                            />
                          </div>
                          <div>
                            <p className={`font-bold transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-950"}`}>{item.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase mt-0.5">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className={`font-bold transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer Totals */}
                <div className={`flex justify-between items-center pt-4 border-t transition-colors duration-200 ${
                  theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"
                } text-sm`}>
                  <span className="font-bold text-gray-400 uppercase text-xs tracking-wider">Total amount:</span>
                  <span className={`text-xl font-extrabold transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-950"}`}>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
