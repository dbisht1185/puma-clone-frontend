import { FaFacebook, FaInstagram, FaPinterest, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { SiPuma } from "react-icons/si";

export const MobileAccordionDatas = [
  {
    title: "Support",
    items: [
      { name: "Contact Us", href: "/contactus" },
      { name: "Promotions & Sales", href: "/promotions" },
      { name: "Track Order", href: "/trackorder" },
      { name: "Shoe Care", href: "/shoecare" },
      { name: "Tech Glossary", href: "/techglossary" },
      { name: "Initiate Return / Exchange", href: "/initiatereturn" },
      { name: "Sneakers", href: "/sneakers" },
      { name: "Cookie Settings", href: "/cookiesettings" },
      { name: "FAQs", href: "/faqs" },
      { name: "My Account", href: "/myaccount" },
      { name: "Exchange & Return Policy", href: "/exchangereturnpolicy" },
      { name: "Privacy Policy", href: "/privacypolicy" },
      { name: "Terms & Conditions", href: "/termsconditions" },
      { name: "Shoes", href: "/shoes" },
      { name: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    title: "About",
    items: [
      { name: "Company", href: "/company" },
      { name: "Corporate News", href: "/corporatenews" },
      { name: "Press Center", href: "/presscenter" },
      { name: "Investors", href: "/investors" },
      { name: "Sustainability", href: "/sustainability" },
      { name: "Careers", href: "/careers" },
      { name: "Store Locator", href: "/storelocator" },
      { name: "PUMA Articles", href: "/pumaarticles" },
    ],
  },
  {
    title: "Stay up to date",
    items: [
      { name: "Youtube", href: "/youtube", icon: <FaYoutube className="w-6 h-6" /> },
      { name: "Twitter", href: "/twitter", icon: <FaXTwitter className="w-6 h-6" /> },
      { name: "Pinterest", href: "/pinterest", icon: <FaPinterest className="w-6 h-6" /> },
      { name: "Instagram", href: "/instagram", icon: <FaInstagram className="w-6 h-6" /> },
      { name: "Facebook", href: "/facebook", icon: <FaFacebook className="w-6 h-6" /> },
    ],
  },
  {
    title: "Explore",
    items: [
      { name: "APP", icon: <SiPuma className="w-8 h-8" />, href: "/app" },  
      { name: "TRAC", icon: <SiPuma className="w-8 h-8" />, href: "/trac" },  
      { name: "Admin", icon: <SiPuma className="w-8 h-8" />, href: "/admin/dashboard" },  
    ],
  },
];
