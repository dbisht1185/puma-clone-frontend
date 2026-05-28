"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getWishlistFromStorage,
  saveWishlistToStorage,
  isUserLoggedIn,
  clearWishlistStorage,
} from "@/utils/cartStorage";
import { useToast } from "./toaster";
import { parsePrice } from "@/utils/price";
import { wishlistApi } from "@/mocks/wishlist";

const WISHLIST_STORAGE_KEY = "puma_wishlist";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

/**
 * Wishlist item structure:
 * {
 *   id: string (productId),
 *   productId: string,
 *   name: string,
 *   image: string,
 *   basePrice: number,
 *   discountType: "PERCENT" | "FLAT" | null,
 *   discountValue: number,
 *   slug: string (for navigation)
 * }
 */

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setAlert } = useToast();

  // Load wishlist from storage on mount (for API sync when logged in)
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      try {
        if (isUserLoggedIn()) {
          const res = await wishlistApi.getWishlist();
          if (res.data?.status === "SUCCESS") {
            setWishlist(res.data.data);
            saveWishlistToStorage(res.data.data);
          } else {
            const storedWishlist = getWishlistFromStorage();
            if (storedWishlist.length > 0) {
              setWishlist(storedWishlist);
            }
          }
        } else {
          const storedWishlist = getWishlistFromStorage();
          if (storedWishlist.length > 0) {
            setWishlist(storedWishlist);
          }
        }
      } catch (error) {
        console.error("Error loading wishlist from database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();

    // Listen for storage changes (sync across tabs)
    const handleStorageChange = (e) => {
      if (e.key === WISHLIST_STORAGE_KEY || e.key === null) {
        const storedWishlist = getWishlistFromStorage();
        setWishlist(storedWishlist);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save wishlist to storage whenever it changes (immediately, backup for offline/offline mode)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        saveWishlistToStorage(wishlist);
      } catch (error) {
        console.error("Error saving wishlist to storage:", error);
      }
    }
  }, [wishlist]);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((item) => item.productId === productId);
    },
    [wishlist]
  );

  // Add to wishlist
  const addToWishlist = useCallback(
    async (product) => {
      const { productId, name, image, basePrice, discountType = null, discountValue = 0, slug } =
        product;

      if (!productId || !name || !image) {
        setAlert({
          open: true,
          message: "Missing required product information",
          severity: "error",
        });
        return false;
      }

      if (isInWishlist(productId)) {
        setAlert({
          open: true,
          message: "Item already in wishlist",
          severity: "info",
        });
        return false;
      }

      const newItem = {
        id: productId,
        productId,
        name,
        image,
        basePrice: typeof basePrice === "string" ? parseFloat(basePrice.replace(/[₹,\s]/g, "")) || 0 : basePrice,
        discountType,
        discountValue,
        slug: slug || productId,
      };

      if (isUserLoggedIn()) {
        try {
          const res = await wishlistApi.addToWishlist(newItem);
          if (res.data?.status === "SUCCESS") {
            setWishlist(res.data.data);
            setAlert({
              open: true,
              message: "Added to wishlist",
              severity: "success",
            });
            return true;
          } else {
            setAlert({
              open: true,
              message: res.data?.message || "Failed to add to wishlist",
              severity: "error",
            });
            return false;
          }
        } catch (error) {
          console.error(error);
          setAlert({
            open: true,
            message: "Failed to add to wishlist",
            severity: "error",
          });
          return false;
        }
      } else {
        setWishlist((prevWishlist) => [...prevWishlist, newItem]);
        setAlert({
          open: true,
          message: "Added to wishlist",
          severity: "success",
        });
        return true;
      }
    },
    [isInWishlist, setAlert]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (isUserLoggedIn()) {
        try {
          const res = await wishlistApi.removeFromWishlist(productId);
          if (res.data?.status === "SUCCESS") {
            setWishlist(res.data.data);
            setAlert({
              open: true,
              message: "Removed from wishlist",
              severity: "success",
            });
          } else {
            setAlert({
              open: true,
              message: res.data?.message || "Failed to remove from wishlist",
              severity: "error",
            });
          }
        } catch (error) {
          console.error(error);
          setAlert({
            open: true,
            message: "Failed to remove from wishlist",
            severity: "error",
          });
        }
      } else {
        setWishlist((prevWishlist) => {
          const updatedWishlist = prevWishlist.filter((item) => item.productId !== productId);
          setAlert({
            open: true,
            message: "Removed from wishlist",
            severity: "success",
          });
          return updatedWishlist;
        });
      }
    },
    [setAlert]
  );

  // Toggle wishlist (add if not present, remove if present)
  const toggleWishlist = useCallback(
    async (product) => {
      if (isInWishlist(product.productId)) {
        await removeFromWishlist(product.productId);
      } else {
        await addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  // Clear wishlist
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    clearWishlistStorage();
  }, []);

  const value = {
    wishlist,
    isLoading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

