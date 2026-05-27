/**
 * Price calculation utility
 * Handles all price calculations including discounts and quantities
 */

/**
 * Calculate price with discount and quantity
 * @param {Object} params
 * @param {number} params.basePrice - Base price of the product
 * @param {string|null} params.discountType - "PERCENT" | "FLAT" | null
 * @param {number} params.discountValue - Discount value (percentage or flat amount)
 * @param {number} params.quantity - Quantity of items
 * @returns {Object} { unitPrice, discountAmount, totalPrice }
 */
export function calculatePrice({ basePrice, discountType, discountValue, quantity = 1 }) {
  // Ensure basePrice is a number
  const base = parseFloat(basePrice) || 0;
  const qty = parseInt(quantity) || 1;

  let unitPrice = base;
  let discountAmount = 0;

  // Calculate discount
  if (discountType === "PERCENT" && discountValue) {
    const discountPercent = parseFloat(discountValue) || 0;
    discountAmount = (base * discountPercent) / 100;
    unitPrice = base - discountAmount;
  } else if (discountType === "FLAT" && discountValue) {
    discountAmount = parseFloat(discountValue) || 0;
    unitPrice = Math.max(0, base - discountAmount);
  }

  // Calculate total price
  const totalPrice = unitPrice * qty;
  const totalDiscountAmount = discountAmount * qty;

  return {
    unitPrice: Math.round(unitPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
  };
}

/**
 * Format price to Indian Rupee format
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  const numPrice = parseFloat(price) || 0;
  return `₹${numPrice.toLocaleString("en-IN")}`;
}

/**
 * Parse price string to number
 * @param {string} priceString - Price string like "₹7,199"
 * @returns {number} Numeric price
 */
export function parsePrice(priceString) {
  if (!priceString) return 0;
  const numericString = priceString.replace(/[₹,\s]/g, "");
  return parseFloat(numericString) || 0;
}

