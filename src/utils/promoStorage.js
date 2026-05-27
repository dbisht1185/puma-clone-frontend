/**
 * Promo code storage utilities
 * Handles localStorage for promo code persistence
 */

const PROMO_STORAGE_KEY = "puma_applied_promo";

/**
 * Get applied promo from localStorage
 * @returns {Object|null} Applied promo object { code, discount } or null
 */
export function getPromoFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const promo = localStorage.getItem(PROMO_STORAGE_KEY);
    return promo ? JSON.parse(promo) : null;
  } catch (error) {
    console.error("Error reading promo from storage:", error);
    return null;
  }
}

/**
 * Save applied promo to localStorage
 * @param {Object|null} promo - Promo object { code, discount } or null to clear
 */
export function savePromoToStorage(promo) {
  if (typeof window === "undefined") return;
  try {
    if (promo && promo.code && promo.discount !== undefined) {
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promo));
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving promo to storage:", error);
  }
}

/**
 * Clear promo from storage
 */
export function clearPromoStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROMO_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing promo storage:", error);
  }
}

