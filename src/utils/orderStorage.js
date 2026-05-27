/**
 * Order Storage Utility
 * Handles storing and retrieving orders from localStorage
 */

const ORDERS_STORAGE_KEY = "puma_orders";

/**
 * Get all orders from storage
 */
export function getOrdersFromStorage() {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!stored) return [];
    
    const orders = JSON.parse(stored);
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("Error reading orders from storage:", error);
    return [];
  }
}

/**
 * Save orders to storage
 */
export function saveOrdersToStorage(orders) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving orders to storage:", error);
    // Handle quota exceeded error
    if (error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded. Consider clearing old orders.");
    }
  }
}

/**
 * Add a new order
 */
export function addOrderToStorage(order) {
  const orders = getOrdersFromStorage();
  const newOrders = [order, ...orders]; // Add new order at the beginning
  saveOrdersToStorage(newOrders);
  return order;
}

/**
 * Update order status
 */
export function updateOrderStatus(orderId, status, additionalData = {}) {
  const orders = getOrdersFromStorage();
  const updatedOrders = orders.map((order) => {
    if (order.orderId === orderId) {
      const updateData = {
        status,
        ...additionalData,
        updatedAt: new Date().toISOString(),
      };

      // Add timestamps based on status
      if (status === "shipped" && !order.shippedAt) {
        updateData.shippedAt = new Date().toISOString();
      }
      if (status === "out_for_delivery" && !order.outForDeliveryAt) {
        updateData.outForDeliveryAt = new Date().toISOString();
      }
      if (status === "delivered" && !order.deliveredAt) {
        updateData.deliveredAt = new Date().toISOString();
      }

      return {
        ...order,
        ...updateData,
      };
    }
    return order;
  });
  saveOrdersToStorage(updatedOrders);
  return updatedOrders.find((o) => o.orderId === orderId);
}

/**
 * Simulate order progression (for demo purposes)
 * Automatically progresses orders based on time elapsed
 */
export function simulateOrderProgression() {
  const orders = getOrdersFromStorage();
  const now = new Date();
  
  const updatedOrders = orders.map((order) => {
    if (order.status === "cancelled" || order.status === "delivered" || order.status === "returned" || order.status === "return_initiated") {
      return order; // Don't change cancelled/delivered/returned orders
    }

    const orderDate = new Date(order.orderDate);
    const hoursSinceOrder = (now - orderDate) / (1000 * 60 * 60);
    
    let newStatus = order.status;
    let updates = {};

    // Auto-progress orders based on time (for demo)
    if (order.status === "ordered" && hoursSinceOrder >= 2) {
      newStatus = "shipped";
      updates.shippedAt = new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toISOString();
    } else if (order.status === "shipped" && hoursSinceOrder >= 24) {
      newStatus = "out_for_delivery";
      updates.outForDeliveryAt = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (order.status === "out_for_delivery" && hoursSinceOrder >= 48) {
      newStatus = "delivered";
      updates.deliveredAt = new Date(orderDate.getTime() + 48 * 60 * 60 * 1000).toISOString();
    }

    if (newStatus !== order.status) {
      return {
        ...order,
        status: newStatus,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }

    return order;
  });

  saveOrdersToStorage(updatedOrders);
  return updatedOrders;
}

/**
 * Get order by ID
 */
export function getOrderById(orderId) {
  const orders = getOrdersFromStorage();
  return orders.find((order) => order.orderId === orderId);
}

/**
 * Filter orders by time period
 */
export function filterOrdersByPeriod(orders, period) {
  if (!period || period === "all") return orders;
  
  const now = new Date();
  const filterDate = new Date();
  
  switch (period) {
    case "last-six-months":
      filterDate.setMonth(now.getMonth() - 6);
      break;
    case "last-twelve-months":
      filterDate.setMonth(now.getMonth() - 12);
      break;
    default:
      // Year filter (e.g., "2024")
      const year = parseInt(period);
      if (!isNaN(year)) {
        filterDate.setFullYear(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);
        return orders.filter((order) => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= filterDate && orderDate < endDate;
        });
      }
      return orders;
  }
  
  return orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= filterDate;
  });
}

