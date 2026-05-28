"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, createContext, useContext } from "react";
import { FiLayout, FiBox, FiShoppingBag, FiLogOut, FiArrowLeft, FiUser, FiSun, FiMoon, FiMapPin } from "react-icons/fi";
import { SiPuma } from "react-icons/si";

export const AdminThemeContext = createContext();

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [adminName, setAdminName] = useState("Admin User");
  const [theme, setTheme] = useState("dark");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load stored theme
      const storedTheme = localStorage.getItem("adminTheme") || "dark";
      setTheme(storedTheme);

      // Load stored admin name
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setAdminName(storedName);
      }

      // Check Authentication
      if (isLoginPage) {
        setCheckingAuth(false);
        return;
      }

      const token = localStorage.getItem("access Token");
      const role = localStorage.getItem("userRole");

      if (!token || role !== "admin") {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true);
        setCheckingAuth(false);
      }
    }
  }, [pathname, isLoginPage, router]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminTheme", newTheme);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access Token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
    }
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#070709]">{children}</div>;
  }

  if (checkingAuth || !isAuthenticated) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans ${theme === "dark" ? "admin-theme-dark bg-[#060608] text-white" : "admin-theme-light bg-[#f3f4f6] text-gray-800"}`}>
        <div className="relative w-16 h-16 border-4 border-[#333] border-t-red-600 rounded-full animate-spin"></div>
        <p className={`mt-4 text-sm tracking-wider uppercase animate-pulse ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          Verifying Admin Session...
        </p>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <FiLayout className="text-xl" /> },
    { name: "Users", href: "/admin/users", icon: <FiUser className="text-xl" /> },
    { name: "Products", href: "/admin/products", icon: <FiBox className="text-xl" /> },
    { name: "Orders", href: "/admin/orders", icon: <FiShoppingBag className="text-xl" /> },
    { name: "Pincodes", href: "/admin/pincodes", icon: <FiMapPin className="text-xl" /> },
  ];

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen flex font-sans transition-colors duration-200 ${theme === "dark" ? "admin-theme-dark bg-[#060608] text-gray-100" : "admin-theme-light bg-[#f3f4f6] text-gray-800"}`}>
        {/* Sidebar */}
        <aside className={`w-64 border-r flex flex-col justify-between shrink-0 transition-colors duration-200 ${theme === "dark" ? "bg-[#0c0c0e] border-[#1a1a1f]" : "bg-white border-gray-200"}`}>
          <div>
            {/* Logo */}
            <div className={`h-20 flex items-center gap-3 px-6 border-b transition-colors duration-200 ${theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"}`}>
              <SiPuma className={`text-3xl transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-900"}`} />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider uppercase">PUMA Admin</span>
                <span className="text-[10px] text-red-500 font-semibold uppercase tracking-widest">Control Panel</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-red-600 text-white shadow-md shadow-red-900/20"
                        : theme === "dark"
                          ? "text-gray-400 hover:text-white hover:bg-[#121215]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className={`p-4 border-t transition-colors duration-200 ${theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"} space-y-2`}>
            {/* Back to Store */}
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white hover:bg-[#121215]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FiArrowLeft className="text-lg" />
              BACK TO STOREFRONT
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === "dark"
                  ? "text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
              }`}
            >
              <FiLogOut className="text-lg" />
              SIGN OUT
            </button>
          </div>
        </aside>

        {/* Main Layout Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className={`h-20 border-b flex justify-between items-center px-8 sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 ${theme === "dark" ? "bg-[#0c0c0e]/80 border-[#1a1a1f]" : "bg-white/80 border-gray-200"}`}>
            <h1 className={`text-xl font-bold uppercase tracking-wide transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {menuItems.find((item) => pathname === item.href)?.name || "Control Center"}
            </h1>

            <div className="flex items-center gap-6">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#16161a] border-[#2a2a30] text-yellow-400 hover:bg-[#202025] hover:text-yellow-300"
                    : "bg-gray-100 border-gray-200 text-purple-600 hover:bg-gray-200 hover:text-purple-700"
                }`}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <FiSun className="text-lg animate-pulse" />
                ) : (
                  <FiMoon className="text-lg animate-pulse" />
                )}
              </button>

              {/* Admin Info */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-semibold transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{adminName}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border transition-colors duration-200 ${
                    theme === "dark"
                      ? "text-red-500 bg-red-950/20 border-red-900/30"
                      : "text-red-600 bg-red-50 border-red-200"
                  }`}>
                    ADMIN
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-200 ${
                  theme === "dark"
                    ? "bg-[#16161a] border-[#2a2a30] text-white"
                    : "bg-gray-100 border-gray-200 text-gray-800"
                }`}>
                  <FiUser className={`text-lg transition-colors duration-200 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </div>
              </div>
            </div>
          </header>

          {/* Content Container */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeContext.Provider>
  );
}
