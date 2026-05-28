"use client";

import { useState, useEffect } from "react";
import { useAdminTheme } from "../layout";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import { useToast } from "@/context/toaster";
import { pincodesApi } from "@/mocks/pincodes";

export default function AdminPincodes() {
  const { theme } = useAdminTheme();
  const { setAlert } = useToast();
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    deliveryDays: 3,
    isServiceable: true,
    charges: 0,
    city: "",
    state: ""
  });

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const res = await pincodesApi.getAllPincodes();
      if (res.data.status === "SUCCESS") {
        setPincodes(res.data.data);
      }
    } catch (error) {
      setAlert({ open: true, message: "Failed to load pincodes", severity: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openModal = (pincode = null) => {
    if (pincode) {
      setEditingId(pincode._id);
      setFormData({
        code: pincode.code,
        deliveryDays: pincode.deliveryDays,
        isServiceable: pincode.isServiceable,
        charges: pincode.charges,
        city: pincode.city || "",
        state: pincode.state || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        deliveryDays: 3,
        isServiceable: true,
        charges: 0,
        city: "",
        state: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.code.length !== 6) {
      toast.error("PIN code must be exactly 6 characters.");
      return;
    }

    try {
      if (editingId) {
        await pincodesApi.updatePincode(editingId, formData);
        setAlert({ open: true, message: "Pincode updated successfully", severity: "success" });
      } else {
        await pincodesApi.createPincode(formData);
        setAlert({ open: true, message: "Pincode added successfully", severity: "success" });
      }
      closeModal();
      fetchPincodes();
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || "Operation failed", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PIN code?")) return;
    try {
      await pincodesApi.deletePincode(id);
      setAlert({ open: true, message: "Pincode deleted", severity: "success" });
      fetchPincodes();
    } catch (error) {
      setAlert({ open: true, message: "Failed to delete pincode", severity: "error" });
    }
  };

  const filteredPincodes = pincodes.filter((pin) =>
    pin.code.includes(search) ||
    (pin.city && pin.city.toLowerCase().includes(search.toLowerCase())) ||
    (pin.state && pin.state.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className={`relative flex items-center w-full md:w-96 rounded-lg border overflow-hidden transition-all duration-200 ${
          theme === "dark" ? "bg-[#16161a] border-[#2a2a30]" : "bg-white border-gray-200"
        }`}>
          <FiSearch className={`absolute left-3 text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Search by PIN, city, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full py-2.5 pl-10 pr-4 outline-none bg-transparent ${
              theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
        
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors shadow-lg shadow-red-900/20"
        >
          <FiPlus className="text-lg" /> Add Pincode
        </button>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${
        theme === "dark" ? "bg-[#16161a] border-[#2a2a30]" : "bg-white border-gray-200"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs uppercase tracking-wider ${
                theme === "dark" ? "bg-[#0c0c0e] border-[#2a2a30] text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"
              }`}>
                <th className="p-4 font-bold">PIN Code</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Delivery Time</th>
                <th className="p-4 font-bold">Charges</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a30]/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Loading pincodes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPincodes.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`p-8 text-center italic ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    No pincodes found matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredPincodes.map((pin) => (
                  <tr key={pin._id} className={`transition-colors hover:${theme === "dark" ? "bg-[#1c1c21]" : "bg-gray-50"}`}>
                    <td className="p-4 font-bold text-red-500">{pin.code}</td>
                    <td className="p-4">
                      {pin.city && pin.state ? (
                        <span className="text-sm">{pin.city}, {pin.state}</span>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Not specified</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-semibold">{pin.deliveryDays} Days</td>
                    <td className="p-4 text-sm font-semibold">₹{pin.charges}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        pin.isServiceable
                          ? (theme === "dark" ? "bg-green-950/30 text-green-400" : "bg-green-100 text-green-700")
                          : (theme === "dark" ? "bg-red-950/30 text-red-400" : "bg-red-100 text-red-700")
                      }`}>
                        {pin.isServiceable ? "Serviceable" : "Blocked"}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button
                        onClick={() => openModal(pin)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === "dark" ? "hover:bg-[#2a2a30] text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                        }`}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(pin._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === "dark" ? "hover:bg-red-950/30 text-red-500 hover:text-red-400" : "hover:bg-red-50 text-red-600 hover:text-red-700"
                        }`}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${
            theme === "dark" ? "bg-[#0c0c0e] border-[#2a2a30]" : "bg-white border-gray-200"
          }`}>
            <div className={`flex justify-between items-center p-5 border-b ${
              theme === "dark" ? "border-[#2a2a30]" : "border-gray-200"
            }`}>
              <h2 className={`text-lg font-bold tracking-wider uppercase ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {editingId ? "Edit Pincode" : "Add New Pincode"}
              </h2>
              <button onClick={closeModal} className={`p-1.5 rounded-lg transition-colors ${
                theme === "dark" ? "hover:bg-[#2a2a30] text-gray-400" : "hover:bg-gray-100 text-gray-600"
              }`}>
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>PIN Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    maxLength="6"
                    required
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                      theme === "dark" ? "bg-[#16161a] border-[#2a2a30] text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                    placeholder="E.g. 110001"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                        theme === "dark" ? "bg-[#16161a] border-[#2a2a30] text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                      placeholder="City Name"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                        theme === "dark" ? "bg-[#16161a] border-[#2a2a30] text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                      placeholder="State Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Delivery Days</label>
                    <input
                      type="number"
                      name="deliveryDays"
                      value={formData.deliveryDays}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                        theme === "dark" ? "bg-[#16161a] border-[#2a2a30] text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Charges (₹)</label>
                    <input
                      type="number"
                      name="charges"
                      value={formData.charges}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                        theme === "dark" ? "bg-[#16161a] border-[#2a2a30] text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isServiceable"
                      checked={formData.isServiceable}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                  <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Serviceable (Enable Delivery)
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#2a2a30]">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${
                    theme === "dark" ? "bg-[#16161a] hover:bg-[#202025] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm tracking-wider uppercase transition-colors shadow-lg shadow-red-900/20"
                >
                  {editingId ? "Update" : "Save Pincode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
