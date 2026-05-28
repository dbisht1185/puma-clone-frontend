import apiClient from "./apiClient";

class WishlistApi {
  // Fetch current user's wishlist from MongoDB
  async getWishlist() {
    return apiClient.get("/wishlist");
  }

  // Add item to user's database wishlist
  async addToWishlist(productData) {
    return apiClient.post("/wishlist", productData);
  }

  // Delete item from user's database wishlist
  async removeFromWishlist(productId) {
    return apiClient.delete(`/wishlist/${productId}`);
  }
}

export const wishlistApi = new WishlistApi();
