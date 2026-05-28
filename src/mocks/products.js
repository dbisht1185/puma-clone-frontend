import apiClient from "./apiClient";

class ProductsApi {
  // Fetch all products (optional filters)
  async getProducts(params = {}) {
    return apiClient.get("/products", { params });
  }

  // Fetch single product by id or slug
  async getProductByIdOrSlug(slugOrId) {
    return apiClient.get(`/products/${slugOrId}`);
  }

  // Create new product (Admin only, token injected automatically)
  async createProduct(data) {
    return apiClient.post("/products", data);
  }

  // Update product (Admin only, token injected automatically)
  async updateProduct(id, data) {
    return apiClient.put(`/products/${id}`, data);
  }

  // Delete product (Admin only, token injected automatically)
  async deleteProduct(id) {
    return apiClient.delete(`/products/${id}`);
  }
}

export const productsApi = new ProductsApi();
