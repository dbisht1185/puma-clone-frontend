"use client";

import React, { useState, useEffect } from "react";
import SideBar from "@/components/Account/SideBar";
import { authApi } from "@/mocks/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/toaster";
import { FiUser, FiLock, FiCalendar, FiPhone, FiMail } from "react-icons/fi";

export default function AccountSettingsPage() {
  const queryClient = useQueryClient();
  const { setAlert } = useToast();

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: ""
  });

  // Password Form States
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch real-time user profile from MongoDB
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.data?.status === "SUCCESS" ? res.data.data : null;
    }
  });

  // Populate form fields once profile loads
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        gender: userProfile.gender || "",
        dob: userProfile.dob ? new Date(userProfile.dob).toISOString().split("T")[0] : ""
      });
    }
  }, [userProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setAlert({
        open: true,
        message: "Full Name is required",
        severity: "error"
      });
      return;
    }

    try {
      const res = await authApi.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        dob: profileData.dob || null
      });

      if (res.data?.status === "SUCCESS") {
        setAlert({
          open: true,
          message: "Profile settings updated successfully!",
          severity: "success"
        });
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        // Update user storage name
        if (typeof window !== "undefined") {
          localStorage.setItem("userName", profileData.name);
        }
      } else {
        setAlert({
          open: true,
          message: res.data?.message || "Failed to update profile details",
          severity: "error"
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        open: true,
        message: "Server error during profile save",
        severity: "error"
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setAlert({
        open: true,
        message: "Please fill out all password fields",
        severity: "error"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setAlert({
        open: true,
        message: "New password must be at least 6 characters long",
        severity: "error"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({
        open: true,
        message: "Confirm password does not match new password",
        severity: "error"
      });
      return;
    }

    try {
      const res = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data?.status === "SUCCESS") {
        setAlert({
          open: true,
          message: "Password changed successfully!",
          severity: "success"
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setAlert({
          open: true,
          message: res.data?.message || "Failed to update password",
          severity: "error"
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        open: true,
        message: "Failed to update password due to server error",
        severity: "error"
      });
    }
  };

  return (
    <div className="w-full flex min-h-screen bg-gray-50">
      <div className="w-[300px] lg:block hidden shrink-0 border-r border-gray-200">
        <SideBar />
      </div>

      <div className="w-full px-4 md:px-10 py-12 flex flex-col gap-8 max-w-4xl">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500">Update your profile parameters and manage credentials</p>
        </div>

        <div className="border-b border-gray-200" />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* PROFILE DETAILS CARD */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <FiUser className="text-xl text-gray-700" />
                <h2 className="text-lg font-bold text-gray-950 uppercase tracking-wide">Personal Information</h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="e.g. Suman Kumar"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>

                {/* Email (Disabled ID) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Email Address (Account ID)
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 font-mono focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Gender Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Gender Classification
                  </label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black text-black bg-white cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="dob"
                      value={profileData.dob}
                      onChange={handleProfileChange}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* PASSWORD SECURITY CARD */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <FiLock className="text-xl text-gray-700" />
                <h2 className="text-lg font-bold text-gray-950 uppercase tracking-wide">Login Credentials</h2>
              </div>

              <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Current Password */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Current Secret Password *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    New Secret Password *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md shadow-red-900/10"
                  >
                    Change Password
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