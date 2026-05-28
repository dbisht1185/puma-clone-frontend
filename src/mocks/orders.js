import apiClient from "./apiClient";

class OrdersApi {
  // Create new order (token injected automatically)
  async createOrder(data) {
    return apiClient.post("/orders", data);
  }

  // Place a dynamic cart-based order (token injected automatically)
  async placeOrder(data) {
    return apiClient.post("/orders/place", data);
  }

  // Get current customer's order history (token injected automatically)
  async getMyOrders() {
    return apiClient.get("/orders/my-orders");
  }

  // Get all store orders (Admin only, token injected automatically)
  async getAllOrders(params = {}) {
    return apiClient.get("/orders", { params });
  }

  // Update order status (Admin only, token injected automatically)
  async updateOrderStatus(id, status) {
    return apiClient.put(`/orders/${id}/status`, { status });
  }

  // Cancel order (token injected automatically)
  async cancelOrder(id) {
    return apiClient.put(`/orders/${id}/cancel`);
  }
}

export const ordersApi = new OrdersApi();
