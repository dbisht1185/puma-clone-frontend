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

// Initialize wishlist from localStorage (client-side only)
const getInitialWishlist = () => {
  if (typeof window === "undefined") return [];
  try {
    return getWishlistFromStorage();
  } catch (error) {
    console.error("Error loading initial wishlist:", error);
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(getInitialWishlist);
  const [isLoading, setIsLoading] = useState(false);
  const { setAlert } = useToast();

  // Load wishlist from storage on mount (for API sync when logged in)
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      try {
        if (isUserLoggedIn()) {
          // TODO: Load from API when backend is ready
          // const response = await fetch('/api/wishlist');
          // const data = await response.json();
          // setWishlist(data.items || []);
          // For now, use localStorage even when logged in
          const storedWishlist = getWishlistFromStorage();
          if (storedWishlist.length > 0) {
            setWishlist(storedWishlist);
          }
        } else {
          const storedWishlist = getWishlistFromStorage();
          if (storedWishlist.length > 0) {
            setWishlist(storedWishlist);
          }
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
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

  // Save wishlist to storage whenever it changes (immediately, not waiting for loading)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (isUserLoggedIn()) {
          // TODO: Sync with API when backend is ready
          // saveWishlistToAPI(wishlist);
          // For now, also save to localStorage as backup
          saveWishlistToStorage(wishlist);
        } else {
          saveWishlistToStorage(wishlist);
        }
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
    (product) => {
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

      setWishlist((prevWishlist) => {
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
        setAlert({
          open: true,
          message: "Added to wishlist",
          severity: "success",
        });
        return [...prevWishlist, newItem];
      });

      return true;
    },
    [isInWishlist, setAlert]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    (productId) => {
      setWishlist((prevWishlist) => {
        const updatedWishlist = prevWishlist.filter((item) => item.productId !== productId);
        setAlert({
          open: true,
          message: "Removed from wishlist",
          severity: "success",
        });
        return updatedWishlist;
      });
    },
    [setAlert]
  );

  // Toggle wishlist (add if not present, remove if present)
  const toggleWishlist = useCallback(
    (product) => {
      if (isInWishlist(product.productId)) {
        removeFromWishlist(product.productId);
      } else {
        addToWishlist(product);
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

