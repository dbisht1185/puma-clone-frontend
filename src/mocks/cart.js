import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create an axios instance with interceptors for tokens
const cartAxios = axios.create({
  baseURL: `${API_URL}/cart`,
  headers: {
    'Content-Type': 'application/json',
  },
});

cartAxios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access Token"); // Same as auth token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const cartApi = {
  // Get logged-in user's cart
  getCart: () => cartAxios.get('/'),

  // Add an item to cart
  addToCart: (productData) => cartAxios.post('/add', productData),

  // Update quantity of an item
  updateCartItem: (itemId, quantity) => cartAxios.put('/update', { itemId, quantity }),

  // Remove an item from cart
  removeFromCart: (itemId) => cartAxios.delete(`/remove/${itemId}`),

  // Clear all items in cart
  clearCart: () => cartAxios.delete('/clear'),

  // Merge guest local cart with user cart on login
  mergeCart: (items) => cartAxios.post('/merge', { items }),
};
