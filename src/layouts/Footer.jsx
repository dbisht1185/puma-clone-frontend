"use client";

import AccordianFooter from "@/components/Footer/FooterAccordian/AccordianFooter";
import CountrySearch from "@/components/Footer/India/CountrySearch";
import { AboutDatas } from "@/constant/Footer/About";
import { PaymentIconsDatas } from "@/constant/Footer/PaymentIcons";
import { SocialMediaDatas } from "@/constant/Footer/SocialMedia";
import { SupportDatas } from "@/constant/Footer/Support";
import { Drawer } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SiPuma } from "react-icons/si";
import { FiSun, FiMoon } from "react-icons/fi";

const Footer = () => {
  const [country, setCountry] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [shopTheme, setShopTheme] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("shopTheme") || "light";
      setShopTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setShopTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("shopTheme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handelCountry = () => {
    setCountry(!country);
  };

  const handleAdminClick = () => {
    setIsLoadingAdmin(true);
    setTimeout(() => {
      setIsLoadingAdmin(false);
    }, 8000);
  };

  return (
    <div className="w-full bg-[#181818] text-white  ">
      <div className="relative xl:px-25 lg:px-15 px-10 hidden lg:block">
        <div className="grid grid-cols-4 gap-5 pt-10 pb-2">
          <div className="grid grid-cols-2 col-span-2 items-start">
            <div className="flex flex-col gap-2">
              <h1 className="tracking-[1px] text-[18px] font-bold">
                {"Support".toUpperCase()}
              </h1>
              {SupportDatas.slice(0, 8).map((data, index) => (
                <Link href={data.href} key={index}>
                  <p className="text-[rgb(215,211,211)] hover:text-white tracking-[1px] text-[15px] place-self-start">
                    {data.name}
                  </p>
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 my-10">
              {SupportDatas.slice(8).map((data, index) => (
                <Link href={data.href} key={index + 8}>
                  <p className="text-[rgb(215,211,211)] hover:text-white tracking-[1px] text-[15px] place-self-start">
                    {data.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="">
            <h1 className="tracking-[1px] text-[18px] font-bold">ABOUT</h1>
            <div className="flex flex-col gap-2 my-2">
              {AboutDatas.map((data, index) => (
                <Link href={data.href} key={index}>
                  <p className="text-[rgb(215,211,211)] hover:text-white tracking-[1px] text-[15px]">
                    {data.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-10 ">
            <div className="flex flex-col gap-7">
              <h1 className="text-[18px] font-bold">
                {"Stay up to date".toUpperCase()}
              </h1>
              <div className="flex gap-6 items-center">
                {SocialMediaDatas.map((data, index) => (
                  <Link
                    href={data.href}
                    key={index}
                    className="w-10 h-10 flex flex-col items-center justify-center rounded-full cursor-pointer hover:border-white hover:bg-[#404040]">
                   {data.img}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="text-[18px] font-bold">
                {"Explore".toUpperCase()}
              </h1>
              <div className="flex gap-10">
                <Link href="/app">
                  <div className="border border-[rgb(102,98,98)] w-[65px] h-[65px] rounded-md flex flex-col items-center justify-center p-2 cursor-pointer hover:border-white text-center">
                    <SiPuma className="w-15 h-15" />
                    <p className="tracking-[2px] text-[12px]">App</p>
                  </div>
                </Link>
                <Link href="/trac">
                  <div className="border border-[rgb(102,98,98)] w-[65px] h-[65px] rounded-md flex flex-col items-center justify-center p-2 cursor-pointer hover:border-white text-center">
                    <SiPuma className="w-15 h-15" />
                    <p className="tracking-[2px] text-[12px]">TRAC</p>
                  </div>
                </Link>
                <Link href="/admin/dashboard" onClick={handleAdminClick}>
                  <div className="border border-[rgb(102,98,98)] w-[65px] h-[65px] rounded-md flex flex-col items-center justify-center p-2 cursor-pointer hover:border-white text-center">
                    <SiPuma className="w-15 h-15" />
                    <p className="tracking-[2px] text-[12px]">Admin</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:px-15 px-10 ">
        <div className="border-b-1 border-[rgb(215,211,211)]"></div>
      </div>

      <div className="block lg:hidden w-full">
      <AccordianFooter />
      <div className="flex flex-col gap-3 md:px-10 px-5 my-5">
          <div
            onClick={handelCountry}
            className="w-full h-12 flex gap-3 items-center justify-center border border-[rgb(215,211,211)] cursor-pointer hover:border-white rounded-[2px] ">
            <div className="w-8 h-8 rounded-full overflow-hidden border relative">
              <Image
                src="/india.svg"
                alt="India"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h1 className="text-[18px] text-white font-bold">INDIA</h1>
          </div>

          {/* Theme Switcher Button Capsule (Mobile) */}
          <div className="flex bg-[#2a2a2a] border border-[#404040] p-1 rounded-full items-center justify-between gap-1 w-full relative select-none h-12">
            {/* Sliding backdrop indicator */}
            <div 
              className="absolute top-1 bottom-1 bg-white rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{
                width: 'calc(50% - 6px)',
                left: shopTheme === 'dark' ? 'calc(50% + 2px)' : '4px',
              }}
            />
            
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-1 z-10 text-sm font-bold transition-colors duration-200 cursor-pointer h-full ${
                shopTheme === "light" ? "text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <FiSun className="text-base" />
              LIGHT MODE
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-1 z-10 text-sm font-bold transition-colors duration-200 cursor-pointer h-full ${
                shopTheme === "dark" ? "text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <FiMoon className="text-base" />
              DARK MODE
            </button>
          </div>
        </div>
      <div className="w-full lg:px-15 md:px-10 px-5 ">
        <div className="border-b-1 border-[rgb(215,211,211)]"></div>
      </div>
     
      </div>
      <div className="w-full px-14 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 py-10 text-center text-[14px] text-gray-400 gap-5 ">
        <div className=" flex gap-2 items-center ">
          {PaymentIconsDatas.map((data, index) => (
            <div
              key={index}
              className="border w-10 h-6 flex items-center justify-center bg-[#FFFFFF] rounded-[2px]">
              <img
                src={data.image}
                alt={data.name}
                className="max-h-[16px] max-w-[30px] object-contain"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center gap-4 hidden lg:flex">
          <div
            onClick={handelCountry}
            className="w-40 h-12 flex gap-3 items-center justify-center border cursor-pointer hover:border-white rounded-md">
            <div className="w-8 h-8 rounded-full overflow-hidden border relative">
              <Image
                src="/india.svg"
                alt="India"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h1 className="text-[18px] text-white font-bold">INDIA</h1>
          </div>

          {/* Theme Selector Capsule (Desktop) */}
          <div className="flex bg-[#2a2a2a] border border-[#404040] p-1 rounded-full items-center justify-between gap-1 w-[160px] relative select-none h-10">
            {/* Sliding backdrop indicator */}
            <div 
              className={`absolute top-1 bottom-1 w-[74px] bg-white rounded-full transition-all duration-300 ease-out shadow-lg ${
                shopTheme === "dark" ? "left-[81px]" : "left-1"
              }`}
            />
            
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 z-10 text-xs font-bold transition-colors duration-200 cursor-pointer h-full ${
                shopTheme === "light" ? "text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <FiSun className="text-sm" />
              LIGHT
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 z-10 text-xs font-bold transition-colors duration-200 cursor-pointer h-full ${
                shopTheme === "dark" ? "text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <FiMoon className="text-sm" />
              DARK
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end justify-center">
          <p className=" text-[12px]">
            {"© PUMA India Ltd, 2025. All Rights Reserved.".toUpperCase()}
          </p>
          <p className="border-b text-[12px]">
            {"Imprint and Legal Data".toUpperCase()}
          </p>
        </div>
      </div>
      <Drawer
        anchor="bottom"
        open={country}
        onClose={handelCountry}
        sx={{
          "& .MuiDrawer-paper": {
            width: "90%",
            height: "auto",
            margin: "0 auto",
            borderRadius: "5px 5px 0 0",
            padding: "25px",
            "@media (min-width:600px)": { 
        width: "75%",
      },
      "@media (min-width:900px)": { 
        width: "50%",
      },
      "@media (min-width:1200px)": { 
        width: "30%",
      },
          },
        }}>
        <div className="text-black bg-white w-full m-auto">
          <CountrySearch handleCountry={handelCountry} />
        </div>
      </Drawer>
      {isLoadingAdmin && (
        <div className="fixed inset-0 z-[9999] bg-[#000000eb] backdrop-blur-md flex flex-col items-center justify-center text-white font-sans">
          <div className="relative flex flex-col items-center">
            {/* Spinning Neon Glowing Loader */}
            <div className="w-20 h-20 rounded-full border-4 border-t-red-600 border-r-transparent border-b-gray-800 border-l-transparent animate-spin shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
            <SiPuma className="w-12 h-12 text-white animate-pulse absolute top-4" />
            <h2 className="mt-8 text-xl font-bold tracking-[3px] uppercase text-white animate-pulse">
              PUMA ADMIN CONTROL
            </h2>
            <p className="mt-2 text-sm tracking-wider text-gray-400">
              Initializing Secure Session...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer;
