"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/mocks/auth";
import { SiPuma } from "react-icons/si";
import { useToast } from "@/context/toaster";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const toastContext = useToast();
  const setAlert = toastContext?.setAlert;

  useEffect(() => {
    // If already logged in as admin, auto-redirect to dashboard
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access Token");
      const role = localStorage.getItem("userRole");
      if (token && role === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [router]);

  // Yup validation schema for clean validation errors and NO browser default tooltip popups!
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await authApi.login({
          username: values.email, // checks username or email
          password: values.password,
        });

        if (res?.data?.status === "SUCCESS") {
          const { token, id, role, name } = res.data.data;

          if (role !== "admin") {
            setAlert?.({
              open: true,
              message: "Access Denied: Admin privileges required!",
              severity: "error",
            });
            setLoading(false);
            return;
          }

          // Store Admin Details
          localStorage.setItem("access Token", token);
          localStorage.setItem("userId", id);
          localStorage.setItem("userRole", role);
          localStorage.setItem("userName", name);

          setAlert?.({
            open: true,
            message: "Welcome, Administrator! Logging in...",
            severity: "success",
          });

          router.push("/admin/dashboard");
        } else {
          setAlert?.({
            open: true,
            message: res?.data?.message || "Invalid Admin Credentials",
            severity: "error",
          });
        }
      } catch (error) {
        console.error(error);
        setAlert?.({
          open: true,
          message: error.response?.data?.message || "Server Error. Please try again later.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-center items-center px-6 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-950/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-slate-900/40 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] bg-[#0c0c0e]/80 border border-[#1d1d22] rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10 transition-all duration-300 hover:border-red-900/30">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/30 mb-4 animate-pulse">
            <SiPuma size={28} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">
            ADMINISTRATOR PORTAL
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
            Enter credentials to access core configurations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Admin Email
            </label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. admin@puma.com"
              className={`w-full px-4 py-3 bg-[#131317] border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-[#23232a] focus:border-red-600 focus:ring-1 focus:ring-red-600"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-[11px] text-red-500 font-semibold tracking-wide uppercase mt-1">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Secret Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Password"
                className={`w-full pl-4 pr-12 py-3 bg-[#131317] border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-[#23232a] focus:border-red-600 focus:ring-1 focus:ring-red-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer p-1 focus:outline-none flex items-center justify-center"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="text-lg" />
                ) : (
                  <FiEye className="text-lg" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-[11px] text-red-500 font-semibold tracking-wide uppercase mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider rounded-lg shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN TO DASHBOARD"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-8 relative z-10">
        Authorized Personnel Only © {new Date().getFullYear()} Puma Systems
      </p>
    </div>
  );
}
