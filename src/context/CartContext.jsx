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
import { cartApi } from "@/mocks/cart";

const CART_STORAGE_KEY = "puma_cart";
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setAlert } = useToast();

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        if (isUserLoggedIn()) {
          // Merge any local guest cart to the server
          const storedCart = getCartFromStorage();
          if (storedCart.length > 0) {
            try {
              await cartApi.mergeCart(storedCart);
              clearCartStorage(); // Clear local after successful merge
            } catch (err) {
              console.error("Failed to merge cart:", err);
            }
          }

          // Fetch fresh cart from DB
          const response = await cartApi.getCart();
          if (response.data?.status === 'SUCCESS') {
            setCart(response.data.data?.items || []);
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

    // Listen for storage changes (sync across tabs for guests)
    const handleStorageChange = (e) => {
      if (!isUserLoggedIn() && (e.key === CART_STORAGE_KEY || e.key === null)) {
        const storedCart = getCartFromStorage();
        setCart(storedCart);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save cart to storage whenever it changes ONLY for guests
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (!isUserLoggedIn()) {
          saveCartToStorage(cart);
        }
      } catch (error) {
        console.error("Error saving cart to storage:", error);
      }
    }
  }, [cart]);

  // Add item to cart
  const addToCart = useCallback(
    async (product) => {
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
        setAlert({ open: true, message: "Missing required product information", severity: "error" });
        return false;
      }

      if (!size) {
        setAlert({ open: true, message: "Please select a size", severity: "warning" });
        return false;
      }

      if (quantity > stock) {
        setAlert({ open: true, message: `Only ${stock} items available in stock`, severity: "warning" });
        return false;
      }

      const parsedBasePrice = typeof basePrice === "string" ? parsePrice(basePrice) : basePrice;

      if (isUserLoggedIn()) {
        try {
          const res = await cartApi.addToCart({
            productId,
            name,
            image,
            size,
            variant,
            basePrice: parsedBasePrice,
            discountType,
            discountValue,
            quantity,
            stock,
            color,
            styleNumber
          });

          if (res.data?.status === 'SUCCESS') {
            // Because mongoose changes id to _id, map it
            const updatedItems = res.data.data.items.map(item => ({ ...item, id: item._id }));
            setCart(updatedItems);
            setAlert({ open: true, message: "Item added to cart", severity: "success" });
            return true;
          }
        } catch (error) {
          setAlert({ open: true, message: error.response?.data?.message || "Failed to add to cart", severity: "error" });
          return false;
        }
      } else {
        // Guest Logic
        setCart((prevCart) => {
          const existingItemIndex = prevCart.findIndex((item) => item.productId === productId && item.size === size);
          if (existingItemIndex !== -1) {
            const existingItem = prevCart[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > stock) {
              setAlert({ open: true, message: `Only ${stock} items available in stock`, severity: "warning" });
              return prevCart;
            }

            const updatedCart = [...prevCart];
            updatedCart[existingItemIndex] = { ...existingItem, quantity: newQuantity };
            setAlert({ open: true, message: "Item added to cart", severity: "success" });
            return updatedCart;
          } else {
            const newItem = {
              id: `${productId}-${size}-${Date.now()}`,
              productId,
              name,
              image,
              size,
              variant,
              basePrice: parsedBasePrice,
              discountType,
              discountValue,
              quantity,
              stock,
              color,
              styleNumber,
            };
            setAlert({ open: true, message: "Item added to cart", severity: "success" });
            return [...prevCart, newItem];
          }
        });
        return true;
      }
    },
    [setAlert]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (itemId) => {
      if (isUserLoggedIn()) {
        try {
          const res = await cartApi.removeFromCart(itemId);
          if (res.data?.status === 'SUCCESS') {
            const updatedItems = res.data.data.items.map(item => ({ ...item, id: item._id }));
            setCart(updatedItems);
            setAlert({ open: true, message: "Item removed from cart", severity: "success" });
          }
        } catch (error) {
          setAlert({ open: true, message: "Failed to remove item", severity: "error" });
        }
      } else {
        setCart((prevCart) => {
          const updatedCart = prevCart.filter((item) => item.id !== itemId);
          setAlert({ open: true, message: "Item removed from cart", severity: "success" });
          return updatedCart;
        });
      }
    },
    [setAlert]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (itemId, newQuantity) => {
      if (newQuantity < 1) {
        removeFromCart(itemId);
        return;
      }

      if (isUserLoggedIn()) {
        try {
          const res = await cartApi.updateCartItem(itemId, newQuantity);
          if (res.data?.status === 'SUCCESS') {
            const updatedItems = res.data.data.items.map(item => ({ ...item, id: item._id }));
            setCart(updatedItems);
          }
        } catch (error) {
          setAlert({ open: true, message: error.response?.data?.message || "Failed to update quantity", severity: "error" });
        }
      } else {
        setCart((prevCart) => {
          const itemIndex = prevCart.findIndex((item) => item.id === itemId);
          if (itemIndex === -1) return prevCart;

          const item = prevCart[itemIndex];
          if (newQuantity > item.stock) {
            setAlert({ open: true, message: `Only ${item.stock} items available in stock`, severity: "warning" });
            return prevCart;
          }

          const updatedCart = [...prevCart];
          updatedCart[itemIndex] = { ...item, quantity: newQuantity };
          return updatedCart;
        });
      }
    },
    [removeFromCart, setAlert]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (isUserLoggedIn()) {
      try {
        await cartApi.clearCart();
        setCart([]);
      } catch (error) {
        setAlert({ open: true, message: "Failed to clear cart", severity: "error" });
      }
    } else {
      setCart([]);
      clearCartStorage();
    }
  }, [setAlert]);

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
