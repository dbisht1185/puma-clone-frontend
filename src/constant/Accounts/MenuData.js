import { IoPersonOutline } from "react-icons/io5";
import { PiCubeBold } from "react-icons/pi";
import { HiOutlineHeart } from "react-icons/hi";
import { FaRegAddressBook } from "react-icons/fa6";
import { VscSettings } from "react-icons/vsc";

export const menuItems = [
  { id: 1, name: "Account Overview", icon: <IoPersonOutline/>, path: "/account" },
  { id: 2, name: "My Orders", icon: <PiCubeBold/>, path: "/account/orders" },
  { id: 3, name: "Wishlist", icon: <HiOutlineHeart/>, path: "/account/wishlist" },
  { id: 4, name: "Addresses", icon: <FaRegAddressBook/>, path: "/account/addresses" },
  { id: 5, name: "Account Settings", icon: <VscSettings/>, path: "/account/account-settings" },
];
