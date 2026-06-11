"use client";

import ApplyPromo from "@/components/cart/ApplyPromo";
import TotalPrice from "@/components/cart/TotalPrice";
import OrderDetails from "@/components/Checkout/OrderDetails";
import CardDetails from "@/components/cart/CardDetails";
import { Tab, Tabs } from "@mui/material";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { GrPowerReset } from "react-icons/gr";
import { FaCheckCircle, FaCreditCard, FaTruck, FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/toaster";
import { getPromoFromStorage, clearPromoStorage } from "@/utils/promoStorage";
import { ordersApi } from "@/mocks/orders";
import { pincodesApi } from "@/mocks/pincodes";
import Image from "next/image";

const Page = () => {
  const { cart, getCartTotals, clearCart } = useCart();
  const router = useRouter();
  const { setAlert } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    pinCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    email: "",
    phoneNumber: "",
    billingFirstName: "",
    billingLastName: "",
    billingPinCode: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
  });

  const states = ["Bihar", "Jharkhand", "Goa", "Uttar Pradesh", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu"];
  const countries = ["India", "United States", "Canada", "United Kingdom", "Australia"];

  // Load promo from storage on mount
  useEffect(() => {
    const storedPromo = getPromoFromStorage();
    if (storedPromo) {
      const { subtotal } = getCartTotals();
      const validPromoCodes = {
        SAVE10: { discount: 0.1, type: "PERCENT" },
        FLAT500: { discount: 500, type: "FLAT" },
        WELCOME20: { discount: 0.2, type: "PERCENT" },
      };
      const promo = validPromoCodes[storedPromo.code];
      
      if (promo) {
        let discountAmount = 0;
        if (promo.type === "PERCENT") {
          discountAmount = subtotal * promo.discount;
        } else {
          discountAmount = Math.min(promo.discount, subtotal);
        }
        setPromoDiscount(discountAmount);
      }
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && currentStep === 0) {
      router.push("/cart");
    }
  }, [cart.length, currentStep, router]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCheckboxChange = () => {
    setIsSameAddress((prev) => !prev);
  };

  const validateFields = (updateState = true) => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const pinRegex = /^[0-9]{6}$/;

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "Pin code is required";
    } else if (!pinRegex.test(formData.pinCode.replace(/\s/g, ''))) {
      newErrors.pinCode = "Pin code must be 6 digits";
    }

    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    
    if (!selectedState) newErrors.state = "State is required";
    if (!selectedCountry) newErrors.country = "Country is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, '').replace(/^\+91/, ''))) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    if (updateState) {
      setErrors(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Cart
        return cart.length > 0;
      case 1: // Shipping
        return validateFields(false);
      case 2: // Payment
        return selectedPaymentMethod !== "";
      case 3: // Summary
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateFields(true)) {
        setAlert({
          open: true,
          message: "Please fix the errors in the shipping form",
          severity: "error"
        });
        return;
      }
      
      setIsSubmitting(true);
      try {
        const res = await pincodesApi.checkPincode(formData.pinCode.replace(/\s/g, ''));
        
        if (res.data && res.data.status === "SUCCESS") {
          const pincodeData = res.data.data;
          if (!pincodeData.isServiceable) {
            setAlert({
              open: true,
              message: "Sorry, this Pincode is not serviceable. Please try another one.",
              severity: "error"
            });
            setIsSubmitting(false);
            return;
          }
        } else {
          setAlert({
            open: true,
            message: res.data?.message || "Delivery not available to this PIN code.",
            severity: "error"
          });
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        setAlert({
          open: true,
          message: error?.message || "Error validating PIN code.",
          severity: "error"
        });
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }
    
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setAlert({
        open: true,
        message: "Please complete all required fields before proceeding",
        severity: "warning",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTabChange = (event, newValue) => {
    // Only allow going to previous steps or current step
    if (newValue <= currentStep || validateStep(newValue - 1)) {
      setCurrentStep(newValue);
    } else {
      setAlert({
        open: true,
        message: "Please complete the current step before proceeding",
        severity: "warning",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(1)) {
      setAlert({
        open: true,
        message: "Please fix the errors in the shipping form",
        severity: "error",
      });
      return;
    }

    if (!validateStep(2)) {
      setAlert({
        open: true,
        message: "Please select a payment method",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        pinCode: formData.pinCode,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: selectedState,
        country: selectedCountry,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      const billingAddress = isSameAddress ? shippingAddress : {
        firstName: formData.billingFirstName,
        lastName: formData.billingLastName,
        pinCode: formData.billingPinCode,
        addressLine1: formData.billingAddressLine1,
        addressLine2: formData.billingAddressLine2,
        city: formData.billingCity,
        state: selectedState,
        country: selectedCountry,
      };

      const appliedPromo = getPromoFromStorage();
      
      const payload = {
        shippingAddress,
        billingAddress,
        paymentMethod: selectedPaymentMethod,
        isSameAddress,
        promoCode: appliedPromo?.code || null,
      };

      const response = await ordersApi.placeOrder(payload);

      if (response.data?.status === 'SUCCESS') {
        const orderData = response.data.data;
        
        setAlert({
          open: true,
          message: `Order placed successfully! Order ID: ${orderData._id}`,
          severity: "success",
        });
        
        await clearCart();
        clearPromoStorage();
        
        router.push(`/account/orders`);
      } else {
        setAlert({
          open: true,
          message: response.data?.message || "Failed to place order. Please try again.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "An error occurred while placing your order. Please try again later.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 0, label: "CART", icon: FaShoppingCart },
    { id: 1, label: "SHIPPING", icon: FaTruck },
    { id: 2, label: "PAYMENT", icon: FaCreditCard },
    { id: 3, label: "SUMMARY", icon: FaCheckCircle },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Cart
        return (
          <div className="flex flex-col gap-5">
            <div className="text-xl font-bold">Review Your Cart</div>
            <CardDetails />
            <div className="flex justify-end gap-3 mt-5">
              <Link
                href="/cart"
                className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 font-semibold cursor-pointer">
                BACK TO CART
              </Link>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 font-semibold cursor-pointer">
                CONTINUE TO SHIPPING
              </button>
            </div>
          </div>
        );

      case 1: // Shipping
        return (
          <div className="flex flex-col gap-5">
            <div className="text-xl font-bold">Shipping Information</div>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="flex flex-col gap-5">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-lg font-semibold mb-3">Shipping Address</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      FIRST NAME <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'} cursor-text`}
                    />
                    {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      LAST NAME <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'} cursor-text`}
                    />
                    {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      PIN CODE <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="PIN code"
                      value={formData.pinCode}
                      onChange={(e) => handleInputChange("pinCode", e.target.value)}
                      className={`border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 ${errors.pinCode ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'} cursor-text`}
                    />
                    {errors.pinCode && <span className="text-red-500 text-xs mt-1">{errors.pinCode}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      CITY <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={`border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 ${errors.city ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'} cursor-text`}
                    />
                    {errors.city && <span className="text-red-500 text-xs mt-1">{errors.city}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      ADDRESS LINE 1 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                      className={`border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 ${errors.addressLine1 ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'} cursor-text`}
                    />
                    {errors.addressLine1 && <span className="text-red-500 text-xs mt-1">{errors.addressLine1}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">ADDRESS LINE 2</label>
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                      className="border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-text"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      STATE <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        if (errors.state) setErrors(prev => ({...prev, state: null}));
                      }}
                      className={`border w-full px-3 py-2 text-base cursor-pointer focus:outline-none focus:ring-2 ${errors.state ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'}`}>
                      <option value="">Select a state</option>
                      {states.map((state, index) => (
                        <option key={index} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && <span className="text-red-500 text-xs mt-1">{errors.state}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      COUNTRY <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        if (errors.country) setErrors(prev => ({...prev, country: null}));
                      }}
                      className={`border w-full px-3 py-2 text-base cursor-pointer focus:outline-none focus:ring-2 ${errors.country ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'}`}>
                      <option value="">Select a country</option>
                      {countries.map((country, index) => (
                        <option key={index} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {errors.country && <span className="text-red-500 text-xs mt-1">{errors.country}</span>}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-lg font-semibold mb-3">Contact Information</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      EMAIL <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'} cursor-text`}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold">
                      PHONE NUMBER <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className={`border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 ${errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'focus:ring-gray-400'} cursor-text`}
                    />
                    {errors.phoneNumber && <span className="text-red-500 text-xs mt-1">{errors.phoneNumber}</span>}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-lg font-semibold mb-3">Shipping Method</div>
                <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={true}
                      readOnly
                      className="w-5 h-5 accent-black cursor-pointer"
                    />
                    <span className="font-semibold">Standard Shipping</span>
                  </div>
                  <div className="text-lg font-medium">FREE</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-lg font-semibold mb-3">Billing Address</div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={isSameAddress}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 border rounded cursor-pointer appearance-none checked:bg-black checked:border-black checked:before:content-['✔'] checked:before:text-white checked:before:text-sm checked:before:font-light flex items-center justify-center"
                  />
                  <span className="cursor-pointer" onClick={handleCheckboxChange}>
                    Billing and Shipping details are the same
                  </span>
                </div>
                {!isSameAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold">FIRST NAME</label>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.billingFirstName}
                        onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                        className="border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-text"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold">LAST NAME</label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.billingLastName}
                        onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                        className="border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-text"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold">PIN CODE</label>
                      <input
                        type="text"
                        placeholder="PIN code"
                        value={formData.billingPinCode}
                        onChange={(e) => handleInputChange("billingPinCode", e.target.value)}
                        className="border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-text"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold">CITY</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.billingCity}
                        onChange={(e) => handleInputChange("billingCity", e.target.value)}
                        className="border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-text"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold">ADDRESS LINE 1</label>
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={formData.billingAddressLine1}
                        onChange={(e) => handleInputChange("billingAddressLine1", e.target.value)}
                        className="border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-text"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-bold">ADDRESS LINE 2</label>
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        value={formData.billingAddressLine2}
                        onChange={(e) => handleInputChange("billingAddressLine2", e.target.value)}
                        className="border w-full px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-text"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 mt-5">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 font-semibold cursor-pointer">
                  BACK
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 font-semibold cursor-pointer">
                  CONTINUE TO PAYMENT
                </button>
              </div>
            </form>
          </div>
        );

      case 2: // Payment
        return (
          <div className="flex flex-col gap-5">
            <div className="text-xl font-bold">Payment Method</div>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="flex flex-col gap-5">
              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-3">
                  <div
                    onClick={() => setSelectedPaymentMethod("credit_card")}
                    className={`flex items-center justify-between p-4 border-2 rounded cursor-pointer transition-all ${
                      selectedPaymentMethod === "credit_card"
                        ? "border-black bg-gray-100"
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPaymentMethod === "credit_card"}
                        onChange={() => setSelectedPaymentMethod("credit_card")}
                        className="w-5 h-5 accent-black cursor-pointer"
                      />
                      <div>
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Visa, Mastercard, Rupay</div>
                      </div>
                    </div>
                    <FaCreditCard className="text-2xl text-gray-600" />
                  </div>

                  <div
                    onClick={() => setSelectedPaymentMethod("upi")}
                    className={`flex items-center justify-between p-4 border-2 rounded cursor-pointer transition-all ${
                      selectedPaymentMethod === "upi"
                        ? "border-black bg-gray-100"
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPaymentMethod === "upi"}
                        onChange={() => setSelectedPaymentMethod("upi")}
                        className="w-5 h-5 accent-black cursor-pointer"
                      />
                      <div>
                        <div className="font-semibold">UPI</div>
                        <div className="text-sm text-gray-600">Paytm, Google Pay, PhonePe</div>
                      </div>
                    </div>
                    <div className="text-2xl">💳</div>
                  </div>

                  <div
                    onClick={() => setSelectedPaymentMethod("cod")}
                    className={`flex items-center justify-between p-4 border-2 rounded cursor-pointer transition-all ${
                      selectedPaymentMethod === "cod"
                        ? "border-black bg-gray-100"
                        : "border-gray-300 hover:border-gray-400"
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPaymentMethod === "cod"}
                        onChange={() => setSelectedPaymentMethod("cod")}
                        className="w-5 h-5 accent-black cursor-pointer"
                      />
                      <div>
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive</div>
                      </div>
                    </div>
                    <div className="text-2xl">💰</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-5">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 font-semibold cursor-pointer">
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={!selectedPaymentMethod}
                  className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 font-semibold cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                  CONTINUE TO SUMMARY
                </button>
              </div>
            </form>
          </div>
        );

      case 3: // Summary
        return (
          <div className="flex flex-col gap-5">
            <div className="text-xl font-bold">Order Summary</div>
            
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-lg font-semibold mb-3">Order Items</div>
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-3 border-b border-gray-200 last:border-0">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain rounded"
                        unoptimized={typeof item.image === 'string' && item.image.startsWith('http')}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">Size: {item.size} | Qty: {item.quantity}</div>
                      <div className="font-bold text-sm mt-1">
                        ₹{((item.basePrice - (item.discountAmount || 0)) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="text-lg font-semibold mb-3">Shipping Address</div>
              <div className="text-sm">
                {formData.firstName} {formData.lastName}
                <br />
                {formData.addressLine1}
                {formData.addressLine2 && <><br />{formData.addressLine2}</>}
                <br />
                {formData.city}, {selectedState} - {formData.pinCode}
                <br />
                {selectedCountry}
                <br />
                Phone: {formData.phoneNumber}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <div className="text-lg font-semibold mb-3">Payment Method</div>
              <div className="text-sm capitalize">
                {selectedPaymentMethod.replace("_", " ").toUpperCase()}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5">
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 font-semibold cursor-pointer">
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-black text-white rounded hover:bg-gray-800 font-semibold cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER"}
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-3xl font-bold mb-6">CHECKOUT</div>
        
        {/* Step Indicator */}
        <div className="mb-8">
          <Tabs
            value={currentStep}
            onChange={handleTabChange}
            aria-label="checkout steps"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "bold",
                color: "#999999",
                textTransform: "none",
                borderBottom: "2px solid #ccc",
                minHeight: "48px",
                "&.Mui-selected": {
                  color: "black !important",
                  borderBottom: "2px solid black !important",
                },
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}>
            {steps.map((step) => (
              <Tab
                key={step.id}
                label={
                  <div className="flex items-center gap-2">
                    <step.icon />
                    <span>{step.label}</span>
                    {currentStep > step.id && (
                      <FaCheckCircle className="text-green-600 text-sm" />
                    )}
                  </div>
                }
                disabled={currentStep < step.id && !validateStep(step.id - 1)}
              />
            ))}
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderStepContent()}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex flex-col gap-5">
                <OrderDetails />
                <ApplyPromo onPromoApplied={setPromoDiscount} />
                <div className="border-b border-gray-200"></div>
                <div className="flex gap-2 items-center text-gray-600">
                  <GrPowerReset className="text-xl" />
                  <div className="text-sm font-semibold">
                    Free returns on all qualifying orders.
                  </div>
                </div>
                <div className="border-b border-gray-200"></div>
                <TotalPrice promoDiscount={promoDiscount} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
