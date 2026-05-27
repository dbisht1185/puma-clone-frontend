import React from "react";
import Link from "next/link";
import { menuDats } from "@/constant/Navbar/MenuData";

const DropdownMenu = ({ show, setShow }) => {
  if (!show || !menuDats[show]) return null;

  const { sections } = menuDats[show];

  // Generate URL-friendly slug from link text
  const generateSlug = (linkText) => {
    return linkText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Generate href based on menu item and link
  const getLinkHref = (linkText) => {
    const slug = generateSlug(linkText);
    const basePath = `/products/${show.toLowerCase()}`;
    return `${basePath}?category=${slug}`;
  };

  return (
    <div
      onMouseEnter={() => setShow(show)}
      onMouseLeave={() => setShow(null)}
      className="absolute h-auto top-[80px] left-0 bg-white shadow-lg z-50 transition-all duration-300 p-6 overflow-x-auto border-4 max-w-[100vw] w-full "
    >
      <div className="flex flex-nowrap gap-20 min-w-max">
        {sections.map((section, index) => (
          <div key={index} className="space-y-2 min-w-[200px]">
            {section.heading && (
              <h2 className="font-bold text-[16px] text-black border-b pb-1">
                {section.heading}
              </h2>
            )}
            <ul className="space-y-1">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link
                    href={getLinkHref(link)}
                    onClick={() => setShow(null)}
                    className="text-gray-600 hover:text-black cursor-pointer transition-colors block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;