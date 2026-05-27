"use client";

import { useState, useEffect, useRef } from "react";
import { SiPuma } from "react-icons/si";
import { FaRegHeart } from "react-icons/fa";
import { IoCartOutline, IoMenu } from "react-icons/io5";
import { Badge, Drawer, Tooltip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import Link from "next/link";
import SearchBox from "@/components/Home/Search/SearchBox";
import DropdownMenu from "@/components/Navbar/DropdownMenu";
import { TooltipDatas } from "@/constant/Navbar/TooltipData";
import { authApi } from "@/mocks/auth";
import { useToast } from "@/context/toaster";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const Navbar = () => {
  const [search, setSearch] = useState(false);
  const [show, setShow] = useState(null);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(null);
  const profileButtonRef = useRef(null);

  const router = useRouter();
  const { getCartTotals } = useCart();
  const { wishlist } = useWishlist();

  const storedToken = typeof window !== "undefined" ? localStorage.getItem("access Token") : null;

  const toastContext = useToast();
  
  const { itemCount } = getCartTotals();
  const wishlistCount = wishlist.length;

  if (!toastContext) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { setAlert } = toastContext;

  useEffect(() => {
    if (storedToken) {
      setToken(storedToken);
    }
  }, [storedToken]);

  // console.log("Token", token);

  
  const handleLogout = async () => {
    try {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const res = await authApi.logout({
        user: userId,
      });
      console.log("Logout page Response", res);

      if (res?.data?.status === "SUCCESS") {
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("userId");
          localStorage.removeItem("access Token");
        }
        // Redirect logic after logout
       router.push("/")
        setAlert({
          open: true,
          message: res?.data?.message,
          severity: "success",
        });
      } else {
        setAlert({
          open: true,
          message: res?.data.message || "Otp send Failed!",
          severity: "error",
        });
      }
    } catch (error) {
      console.log(error);
      setAlert({
        open: true,
        message: "Something went wrong. Please try again later.",
        severity: "error",
      });
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const tooltip = document.querySelector(".MuiTooltip-popper");
      const isProfileButton = profileButtonRef.current?.contains(event.target);

      if (isProfileButton) return; // Don't close if clicking profile button

      if (tooltip && !tooltip.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Modified profile button handler
  const handleProfileClick = () => {
    setOpen((prev) => !prev); // Toggle current state
  };

  const handleSearch = () => setSearch(!search);
  const handleLinkClick = () => setOpen(false);

  const menuItems = [
    {
      name: "New",
      href: "/products/new",
      icon: (
        <ElectricBoltIcon
          style={{ color: "#FFC83D", fontSize: "22px", paddingLeft: "2px" }}
        />
      ),
    },
    { name: "Men", href: "/products/men" },
    { name: "Women", href: "/products/women" },
    { name: "Sports", href: "/products/sports" },
    { name: "Motorsports", href: "/products/motorsports" },
    { name: "Collaborations", href: "/products/collaborations" },
    { name: "Kids", href: "/products/kids" },
    { name: "Outlet", href: "/products/outlet" },
  ];

  console.log("ToolTip Data", TooltipDatas);

  return (
    <nav className="sticky top-0 left-0 right-0 z-[1000] bg-[#181818] text-white w-full h-20 flex justify-between items-center px-4 lg:px-10">
      {/* Mobile Menu */}
      <div className="lg:hidden flex gap-5">
        <Link href="/" className="text-white">
          <IoMenu size={30} />
        </Link>
        <button onClick={handleSearch}>
          <SearchIcon className="text-white" />
        </button>
      </div>

      {/* Mobile Logo */}
      <div className="block lg:hidden">
        <Link href="/" className="cursor-pointer">
          <SiPuma size={44} />
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center space-x-5 font-bold">
        <Link href="/" className="text-white cursor-pointer">
          <SiPuma size={34} />
        </Link>
        <DropdownMenu show={show} setShow={setShow} />
        {menuItems.map((item) => (
          <div
            key={item.name}
            onMouseEnter={() => setShow(item.name)}
            onMouseLeave={() => setShow(null)}
            className="relative h-20 flex items-center">
            <Link
              href={item.href}
              className="hover:border-[#8A7350] hover:border-b-2 hover:text-white transition text-[16px] cursor-pointer">
              {item.name} {item.icon}
            </Link>
          </div>
        ))}
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer border border-[#6F4F4F]">
            <SearchIcon className="text-white" />
            <p>SEARCH</p>
          </button>
          <Link
            href="/wishlist"
            className="p-3 rounded-full hover:bg-[#404040] transition-all cursor-pointer"
            aria-label={`Wishlist with ${wishlistCount} items`}>
            <Badge 
              badgeContent={wishlistCount} 
              color="error"
              showZero={false}
              max={99}>
              <FaRegHeart size={20} />
            </Badge>
          </Link>
        </div>

        <div className="flex flex-row-reverse lg:flex-row lg:gap-3 gap-0">
          <Link
            href="/cart"
            className="p-3 rounded-full hover:bg-[#404040] transition-all cursor-pointer"
            aria-label={`Shopping cart with ${itemCount} items`}>
            <Badge 
              badgeContent={itemCount} 
              color="error"
              showZero={false}
              max={99}>
              <IoCartOutline size={25} />
            </Badge>
          </Link>

          <Tooltip
            title={
              <div className="flex flex-col w-full">
                {TooltipDatas.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center py-1">
                      <Link
                        href={
                          token ? "/account" : item.href
                        }
                        onClick={handleLinkClick}
                        className="hover:text-[#8a7350] transition-colors w-full text-[16px] font-normal">
                        {item.title}
                      </Link>
                      {item.title === "Language" && (
                        <span className="flex items-center gap-1 ml-4">
                          EN
                          <img
                            src="/flag-for-india-svgrepo-com.svg"
                            alt="India Flag"
                            className="w-7 h-7"
                          />
                        </span>
                      )}
                    </div>
                    {index !== TooltipDatas.length - 1 && (
                      <hr className="my-2" />
                    )}
                  </div>
                ))}

                {token ? (
                  <div className="flex flex-col gap-3 mt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        handleLinkClick();
                      }}
                      className="bg-black text-white py-2 text-center hover:bg-[#3b4047] transition-colors cursor-pointer text-[16px] font-bold">
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    <Link
                      href="/login"
                      onClick={handleLinkClick}
                      className="bg-black text-white py-2 text-center hover:bg-[#3b4047] transition-colors text-[16px] font-bold cursor-pointer">
                      LOGIN
                    </Link>
                    <Link
                      href="/signup"
                      onClick={handleLinkClick}
                      className="border py-2 text-center hover:bg-gray-100 transition-colors text-[16px] font-bold cursor-pointer">
                      JOIN US
                    </Link>
                  </div>
                )}
              </div>
            }
            arrow
            open={open}
            onClose={() => setOpen(false)}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            interactive
            componentsProps={{
              tooltip: {
                style: {
                  backgroundColor: "white",
                  color: "black",
                  padding: "16px 24px",
                  borderRadius: "8px",
                  minWidth: "320px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                },
              },
              arrow: { style: { color: "white" } },
            }}>
            <button
              ref={profileButtonRef}
              onClick={handleProfileClick}
              className="p-3 rounded-full hover:bg-[#404040] transition-all cursor-pointer">
              <PersonIcon fontSize="medium" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Search Drawer */}
      <Drawer anchor="top" open={search} onClose={handleSearch}>
        <div className="bg-white w-full p-4">
          <SearchBox handleSearch={handleSearch} />
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;
