"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCartFromStorage,
  saveCartToStorage,
  isUserLoggedIn,
  clearCartStorage,
} from "@/utils/cartStorage";
import { calculatePrice, parsePrice } from "@/utils/price";
import { useToast } from "./toaster";

const CART_STORAGE_KEY = "puma_cart";
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

/**
 * Cart item structure:
 * {
 *   id: string (unique cart item id),
 *   productId: string,
 *   name: string,
 *   image: string,
 *   size: string,
 *   variant: string (optional),
 *   basePrice: number,
 *   discountType: "PERCENT" | "FLAT" | null,
 *   discountValue: number,
 *   quantity: number,
 *   stock: number,
 *   color: string (optional),
 *   styleNumber: string (optional)
 * }
 */

// Initialize cart from localStorage (client-side only)
const getInitialCart = () => {
  if (typeof window === "undefined") return [];
  try {
    return getCartFromStorage();
  } catch (error) {
    console.error("Error loading initial cart:", error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(getInitialCart);
  const [isLoading, setIsLoading] = useState(false);
  const { setAlert } = useToast();

  // Load cart from storage on mount (for API sync when logged in)
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        if (isUserLoggedIn()) {
          // TODO: Load from API when backend is ready
          // const response = await fetch('/api/cart');
          // const data = await response.json();
          // setCart(data.items || []);
          // For now, use localStorage even when logged in
          const storedCart = getCartFromStorage();
          if (storedCart.length > 0) {
            setCart(storedCart);
          }
        } else {
          const storedCart = getCartFromStorage();
          if (storedCart.length > 0) {
            setCart(storedCart);
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();

    // Listen for storage changes (sync across tabs)
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY || e.key === null) {
        const storedCart = getCartFromStorage();
        setCart(storedCart);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save cart to storage whenever it changes (immediately, not waiting for loading)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (isUserLoggedIn()) {
          // TODO: Sync with API when backend is ready
          // saveCartToAPI(cart);
          // For now, also save to localStorage as backup
          saveCartToStorage(cart);
        } else {
          saveCartToStorage(cart);
        }
      } catch (error) {
        console.error("Error saving cart to storage:", error);
      }
    }
  }, [cart]);

  // Add item to cart
  const addToCart = useCallback(
    (product) => {
      const {
        productId,
        name,
        image,
        size,
        variant = null,
        basePrice,
        discountType = null,
        discountValue = 0,
        quantity = 1,
        stock = 10,
        color = "",
        styleNumber = "",
      } = product;

      // Validate required fields
      if (!productId || !name || !image || !size) {
        setAlert({
          open: true,
          message: "Missing required product information",
          severity: "error",
        });
        return false;
      }

      // Check if size is selected
      if (!size) {
        setAlert({
          open: true,
          message: "Please select a size",
          severity: "warning",
        });
        return false;
      }

      // Check stock
      if (quantity > stock) {
        setAlert({
          open: true,
          message: `Only ${stock} items available in stock`,
          severity: "warning",
        });
        return false;
      }

      setCart((prevCart) => {
        // Check if item with same productId and size already exists
        const existingItemIndex = prevCart.findIndex(
          (item) => item.productId === productId && item.size === size
        );

        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const existingItem = prevCart[existingItemIndex];
          const newQuantity = existingItem.quantity + quantity;

          if (newQuantity > stock) {
            setAlert({
              open: true,
              message: `Only ${stock} items available in stock`,
              severity: "warning",
            });
            return prevCart;
          }

          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
          setAlert({
            open: true,
            message: "Item added to cart",
            severity: "success",
          });
          return updatedCart;
        } else {
          // Add new item
          const newItem = {
            id: `${productId}-${size}-${Date.now()}`,
            productId,
            name,
            image,
            size,
            variant,
            basePrice: typeof basePrice === "string" ? parsePrice(basePrice) : basePrice,
            discountType,
            discountValue,
            quantity,
            stock,
            color,
            styleNumber,
          };
          setAlert({
            open: true,
            message: "Item added to cart",
            severity: "success",
          });
          return [...prevCart, newItem];
        }
      });

      return true;
    },
    [setAlert]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    (itemId) => {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== itemId);
        setAlert({
          open: true,
          message: "Item removed from cart",
          severity: "success",
        });
        return updatedCart;
      });
    },
    [setAlert]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
      }

      setCart((prevCart) => {
        const itemIndex = prevCart.findIndex((item) => item.id === itemId);
        if (itemIndex === -1) return prevCart;

        const item = prevCart[itemIndex];
        if (newQuantity > item.stock) {
          setAlert({
            open: true,
            message: `Only ${item.stock} items available in stock`,
            severity: "warning",
          });
          return prevCart;
        }

        const updatedCart = [...prevCart];
        updatedCart[itemIndex] = {
          ...item,
          quantity: newQuantity,
        };
        return updatedCart;
      });
    },
    [removeFromCart, setAlert]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    clearCartStorage();
  }, []);

  // Calculate cart totals
  const getCartTotals = useCallback(() => {
    let subtotal = 0;
    let totalDiscount = 0;

    cart.forEach((item) => {
      const { unitPrice, totalDiscountAmount } = calculatePrice({
        basePrice: item.basePrice,
        discountType: item.discountType,
        discountValue: item.discountValue,
        quantity: item.quantity,
      });

      subtotal += item.basePrice * item.quantity;
      totalDiscount += totalDiscountAmount;
    });

    const total = subtotal - totalDiscount;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount,
    };
  }, [cart]);

  // Get item by ID
  const getCartItem = useCallback(
    (itemId) => {
      return cart.find((item) => item.id === itemId);
    },
    [cart]
  );

  const value = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

