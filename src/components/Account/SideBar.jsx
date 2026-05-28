"use client";

import { menuItems } from '@/constant/Accounts/MenuData'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useToast } from '@/context/toaster'
import { authApi } from '@/mocks/auth'

const SideBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setAlert } = useToast();

  // Stop loader once navigation completes and pathname changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("route-change-stop"));
      window.dispatchEvent(new CustomEvent("axios-request-stop"));
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("access Token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        
        setAlert?.({
          open: true,
          message: "Logged out successfully!",
          severity: "success"
        });
        
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLinkClick = (path) => {
    if (pathname !== path && typeof window !== "undefined") {
      // Start global progress bar and route loading overlay instantly
      window.dispatchEvent(new CustomEvent("route-change-start"));
    }
  };

  return (
    <div className="lg:max-w-[300px] w-full bg-[#f6f7f8] py-12 md:px-8 px-0">
      <div className="flex flex-col items-center justify-center gap-3">
        {menuItems.map((items, index) => {
          const isActive = pathname === items.path;
          return (
            <div
              key={index}
              className="w-full flex flex-col items-center justify-center">
              <Link 
                href={items.path}
                onClick={() => handleLinkClick(items.path)}
                className={`w-full flex items-center gap-5 p-5 hover:bg-[#dfe0e1] cursor-pointer transition-all
              ${isActive ? "border-l-[3px] border-black bg-white" : ""}`}>
                <div className="text-[23px] font-bold">{items.icon}</div>
                <div className="text-[16px] font-bold">{items.name}</div>
              </Link>
            </div>
          );
        })}
      </div>
            <div className="flex flex-col gap-10 mt-5 items-start px-5 lg:px-0">
              <div className="text-lg font-bold ">Need Help?</div>
              <div 
                onClick={handleLogout}
                className="text-[14px] font-bold border-b-2 hover:border-black border-[#a1a8af] leading-3 cursor-pointer"
              >
                LOGOUT
              </div>
            </div>
          </div>
  )
}

export default SideBar