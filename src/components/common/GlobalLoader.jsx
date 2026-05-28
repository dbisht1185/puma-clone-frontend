"use client";

import React, { useState, useEffect } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { SiPuma } from "react-icons/si";

export default function GlobalLoader() {
  const [axiosRequests, setAxiosRequests] = useState(0);
  const [mutatingRequests, setMutatingRequests] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  // Automatically track TanStack Query fetch and mutating counters
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  // Automatically stop route navigation loader when pathname changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Sync isDark dynamically based on active shop / admin theme modes
  useEffect(() => {
    const updateTheme = () => {
      if (typeof window !== "undefined") {
        const isAdmin = window.location.pathname.startsWith("/admin");
        if (isAdmin) {
          const stored = localStorage.getItem("adminTheme") || "dark";
          setIsDark(stored === "dark");
        } else {
          // Read shop theme toggled in the footer
          const stored = localStorage.getItem("shopTheme") || "light";
          setIsDark(stored === "dark");
        }
      }
    };

    updateTheme();
    
    // Listen for storage changes across tabs
    window.addEventListener("storage", updateTheme);

    // Keep active checks for same-page theme switch toggling
    const interval = setInterval(updateTheme, 300);

    return () => {
      window.removeEventListener("storage", updateTheme);
      clearInterval(interval);
    };
  }, [pathname]);

  useEffect(() => {
    const handleStart = (e) => {
      setAxiosRequests((prev) => prev + 1);
      const method = e.detail?.method?.toLowerCase() || "";
      if (["post", "put", "delete"].includes(method)) {
        setMutatingRequests((prev) => prev + 1);
      }
    };
    
    const handleStop = (e) => {
      setAxiosRequests((prev) => Math.max(0, prev - 1));
      const method = e.detail?.method?.toLowerCase() || "";
      if (["post", "put", "delete"].includes(method)) {
        setMutatingRequests((prev) => Math.max(0, prev - 1));
      }
    };

    const handleStartRoute = () => {
      setIsNavigating(true);
    };

    const handleStopRoute = () => {
      setIsNavigating(false);
    };

    window.addEventListener("axios-request-start", handleStart);
    window.addEventListener("axios-request-stop", handleStop);
    window.addEventListener("route-change-start", handleStartRoute);
    window.addEventListener("route-change-stop", handleStopRoute);
    
    return () => {
      window.removeEventListener("axios-request-start", handleStart);
      window.removeEventListener("axios-request-stop", handleStop);
      window.removeEventListener("route-change-start", handleStartRoute);
      window.removeEventListener("route-change-stop", handleStopRoute);
    };
  }, []);

  const showTopBar = axiosRequests > 0 || isFetching > 0 || mutatingRequests > 0 || isMutating > 0 || isNavigating;
  const showBlockingSpinner = mutatingRequests > 0 || isMutating > 0;

  // Progress bar logic
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer;
    if (showTopBar) {
      setProgress(10);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Hold until completed
          return prev + (100 - prev) * 0.15; // Slow down logarithmically
        });
      }, 150);
    } else {
      if (progress > 0) {
        setProgress(100);
        timer = setTimeout(() => {
          setProgress(0);
        }, 200);
      }
    }
    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [showTopBar, progress]);

  if (progress === 0 && !showBlockingSpinner && !isNavigating) return null;

  return (
    <>
      {/* Shared Style overrides for high-performance animations */}
      <style>{`
        @keyframes puma-pulse-dark {
          0%, 100% {
            transform: scale(1) translateY(0) rotate(0deg);
            filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.2));
          }
          50% {
            transform: scale(1.15) translateY(-8px) rotate(-4deg);
            filter: drop-shadow(0 0 24px rgba(220, 38, 38, 0.8));
          }
        }
        @keyframes puma-pulse-light {
          0%, 100% {
            transform: scale(1) translateY(0) rotate(0deg);
            filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.05));
          }
          50% {
            transform: scale(1.15) translateY(-8px) rotate(-4deg);
            filter: drop-shadow(0 0 16px rgba(0, 0, 0, 0.25));
          }
        }
        @keyframes ring-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes text-glow {
          0%, 100% {
            opacity: 0.55;
            letter-spacing: 0.4em;
          }
          50% {
            opacity: 1;
            letter-spacing: 0.6em;
          }
        }
        .puma-pulsing-logo-dark {
          animation: puma-pulse-dark 1.6s infinite ease-in-out;
        }
        .puma-pulsing-logo-light {
          animation: puma-pulse-light 1.6s infinite ease-in-out;
        }
        .spinning-loader-ring {
          animation: ring-spin 1.4s infinite linear;
        }
        .text-glowing-pulse {
          animation: text-glow 1.6s infinite ease-in-out;
        }
      `}</style>

      {/* Top Neon Progress Bar */}
      {progress > 0 && (
        <div
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-500 z-[100000] transition-all duration-300 ease-out shadow-[0_0_12px_#dc2626]"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Route Navigation Loading Overlay */}
      {isNavigating && (
        <div className={`fixed inset-0 backdrop-blur-[8px] z-[99998] flex flex-col items-center justify-center select-none pointer-events-auto transition-all duration-300 ${
          isDark ? "bg-[#0f0f11]/85" : "bg-[#f8f9fa]/90"
        }`}>
          <div className="flex flex-col items-center justify-center relative scale-95 md:scale-100">
            {/* Spinning speed-ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className={`absolute inset-0 border-[3px] border-r-transparent border-l-transparent rounded-full spinning-loader-ring ${
                isDark ? "border-t-red-600 border-b-red-600/30" : "border-t-black border-b-black/15"
              }`}></div>
              <div className={`absolute inset-2 border border-dashed rounded-full ${
                isDark ? "border-white/10" : "border-black/5"
              }`}></div>
              
              {/* Leaping Puma Logo Icon */}
              <div className={`relative z-10 text-6xl ${
                isDark 
                  ? "text-white puma-pulsing-logo-dark" 
                  : "text-black puma-pulsing-logo-light"
              }`}>
                <SiPuma />
              </div>
            </div>

            {/* Glowing Brand text & subtitle */}
            <div className="text-center mt-8 space-y-2">
              <h2 className={`font-black text-lg tracking-[0.5em] text-glowing-pulse uppercase mr-[-0.5em] ${
                isDark ? "text-white" : "text-black"
              }`}>
                PUMA
              </h2>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  Loading Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blocking Glassmorphic Modal Spinner for active POST/PUT/DELETE operations */}
      {showBlockingSpinner && (
        <div className={`fixed inset-0 backdrop-blur-[6px] z-[99999] flex flex-col items-center justify-center select-none pointer-events-auto animate-fadeIn transition-all duration-300 ${
          isDark ? "bg-black/75" : "bg-white/40"
        }`}>
          <div className={`p-8 rounded-3xl flex flex-col items-center gap-5 max-w-xs shadow-2xl relative border ${
            isDark ? "bg-[#0c0c0e]/95 border-[#1d1d22]" : "bg-white/95 border-gray-200/80"
          }`}>
            
            {/* Pulsing Puma inside Spinning Ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className={`absolute inset-0 border-[3px] rounded-full spinning-loader-ring ${
                isDark 
                  ? "border-t-red-600 border-r-red-600/20 border-b-red-600/40 border-l-red-600/10" 
                  : "border-t-black border-r-black/20 border-b-black/40 border-l-black/10"
              }`}></div>
              <div className={`text-3.5xl ${
                isDark ? "text-white puma-pulsing-logo-dark" : "text-black puma-pulsing-logo-light"
              }`}>
                <SiPuma />
              </div>
            </div>
            
            <div className="text-center space-y-2 mt-1">
              <p className={`font-extrabold text-xs uppercase tracking-widest ${
                isDark ? "text-white" : "text-black"
              }`}>
                Processing Request
              </p>
              <p className={`text-[9px] uppercase tracking-wider ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>
                Synchronizing with MongoDB...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
