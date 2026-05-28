"use client";

import React, { useState } from "react";
import SideBar from "@/components/Account/SideBar";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { addressesApi } from "@/mocks/addresses";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/toaster";

export default function AccountAddressesPage() {
  const queryClient = useQueryClient();
  const { setAlert } = useToast();
  
  // Modals and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false
  });

  // Fetch user addresses from MongoDB
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const res = await addressesApi.getAddresses();
      return res.data?.status === "SUCCESS" ? res.data.data : [];
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setFormData({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: addresses.length === 0 // default if first
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address) => {
    setEditId(address._id);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "India",
      isDefault: address.isDefault
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.state.trim() || !formData.postalCode.trim()) {
      setAlert({
        open: true,
        message: "Please fill out all required address fields",
        severity: "error"
      });
      return;
    }

    try {
      let res;
      if (editId) {
        res = await addressesApi.updateAddress(editId, formData);
      } else {
        res = await addressesApi.createAddress(formData);
      }

      if (res.data?.status === "SUCCESS") {
        setAlert({
          open: true,
          message: editId ? "Address updated successfully" : "Address saved successfully",
          severity: "success"
        });
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      } else {
        setAlert({
          open: true,
          message: res.data?.message || "Operation failed",
          severity: "error"
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        open: true,
        message: "Server error occurred. Please try again.",
        severity: "error"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const res = await addressesApi.deleteAddress(id);
      if (res.data?.status === "SUCCESS") {
        setAlert({
          open: true,
          message: "Address deleted successfully",
          severity: "success"
        });
        queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      } else {
        setAlert({
          open: true,
          message: "Failed to delete address",
          severity: "error"
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        open: true,
        message: "Failed to delete address due to server error",
        severity: "error"
      });
    }
  };

  const handleSetDefault = async (address) => {
    if (address.isDefault) return;
    try {
      const res = await addressesApi.updateAddress(address._id, { ...address, isDefault: true });
      if (res.data?.status === "SUCCESS") {
        setAlert({
          open: true,
          message: "Default address updated",
          severity: "success"
        });
        queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex min-h-screen bg-gray-50">
      <div className="w-[300px] lg:block hidden shrink-0 border-r border-gray-200">
        <SideBar />
      </div>
      
      <div className="w-full px-4 md:px-10 py-12 flex flex-col gap-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Addresses</h1>
            <p className="text-sm text-gray-500">Manage your shipping and billing addresses</p>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            <FiPlus className="text-sm" />
            ADD NEW ADDRESS
          </button>
        </div>

        <div className="border-b border-gray-200" />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col gap-6 text-center py-16 bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <FiPlus className="text-2xl text-gray-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">You have no saved addresses yet</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Save your shipping details now to experience standard rapid checkouts next time!
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 text-xs font-bold uppercase rounded-lg tracking-wider transition-colors cursor-pointer self-center"
            >
              Add Shipping Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-white border rounded-xl p-6 flex flex-col justify-between shadow-sm relative transition-all group ${
                  address.isDefault ? "border-black ring-1 ring-black" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Default badge */}
                {address.isDefault && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[9px] font-extrabold uppercase rounded-full tracking-widest">
                    <FiCheck className="text-[10px]" /> DEFAULT
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-bold text-base text-gray-900">{address.fullName}</p>
                    <p className="text-xs text-gray-500 font-mono">{address.phone}</p>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-0.5 leading-relaxed font-semibold">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} - {address.postalCode}
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{address.country}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditModal(address)}
                      className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors cursor-pointer"
                      title="Edit Address"
                    >
                      <FiEdit2 className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address)}
                      className="text-xs font-bold text-gray-500 hover:text-black border-b border-transparent hover:border-black transition-all cursor-pointer uppercase tracking-wider py-1"
                    >
                      Set As Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD/EDIT ADDRESS MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-slideIn">
              {/* Header */}
              <div className="h-16 border-b border-gray-100 flex justify-between items-center px-6 bg-gray-50">
                <h3 className="font-bold text-sm uppercase tracking-wider text-black">
                  {editId ? "Edit Address Details" : "Add Shipping Address"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-black text-lg cursor-pointer"
                >
                  <FiX />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Receiver Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Suman Kumar"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Flat, Building, Street Address *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      placeholder="e.g. House No. 42, Green Avenue"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Landmark, Colony, Area (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      placeholder="e.g. Near Central Park"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. New Delhi"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Delhi"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  {/* Pin Code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 110001"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  {/* Default Address Checkbox */}
                  <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      disabled={addresses.length === 0} // must be default if first
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black cursor-pointer"
                    />
                    <label
                      htmlFor="isDefault"
                      className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    >
                      Set as default shipping address
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    {editId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}