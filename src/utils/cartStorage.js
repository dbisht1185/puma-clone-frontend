/**
 * Cart storage utilities
 * Handles localStorage for cart persistence (guest users)
 */

const CART_STORAGE_KEY = "puma_cart";
const WISHLIST_STORAGE_KEY = "puma_wishlist";

/**
 * Get cart from localStorage
 * @returns {Array} Cart items
 */
export function getCartFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    if (!cart) return [];
    const parsed = JSON.parse(cart);
    // Validate that it's an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading cart from storage:", error);
    // Clear corrupted data
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      // Ignore cleanup errors
    }
    return [];
  }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items
 */
export function saveCartToStorage(cart) {
  if (typeof window === "undefined") return;
  try {
    // Validate cart is an array
    if (!Array.isArray(cart)) {
      console.error("Cart must be an array");
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to storage:", error);
    // Handle quota exceeded error
    if (error.name === "QuotaExceededError") {
      console.error("LocalStorage quota exceeded. Clearing old data...");
      try {
        // Try to clear and save again
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart after clearing:", e);
      }
    }
  }
}

/**
 * Get wishlist from localStorage
 * @returns {Array} Wishlist items
 */
export function getWishlistFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const wishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!wishlist) return [];
    const parsed = JSON.parse(wishlist);
    // Validate that it's an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading wishlist from storage:", error);
    // Clear corrupted data
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch (e) {
      // Ignore cleanup errors
    }
    return [];
  }
}

/**
 * Save wishlist to localStorage
 * @param {Array} wishlist - Wishlist items
 */
export function saveWishlistToStorage(wishlist) {
  if (typeof window === "undefined") return;
  try {
    // Validate wishlist is an array
    if (!Array.isArray(wishlist)) {
      console.error("Wishlist must be an array");
      return;
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error("Error saving wishlist to storage:", error);
    // Handle quota exceeded error
    if (error.name === "QuotaExceededError") {
      console.error("LocalStorage quota exceeded. Clearing old data...");
      try {
        // Try to clear and save again
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.error("Failed to save wishlist after clearing:", e);
      }
    }
  }
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isUserLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access Token");
}

/**
 * Clear cart from storage
 */
export function clearCartStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cart storage:", error);
  }
}

/**
 * Clear wishlist from storage
 */
export function clearWishlistStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing wishlist storage:", error);
  }
}

