"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access Token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
      // Not an admin, redirect to admin login
      localStorage.removeItem("access Token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      router.push("/admin/login");
    } else {
      setAuthorized(true);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-sans">
        <div className="relative w-16 h-16 border-4 border-[#333] border-t-red-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 text-sm tracking-wider uppercase animate-pulse">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
