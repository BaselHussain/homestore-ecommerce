import axios from "axios";
import type { Product, CartItem, WishlistItem, Order, ShippingAddress, ProductListResponse } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// Products
export const productsApi = {
  getAll: (params?: { search?: string; category?: string; sort?: string; page?: number; limit?: number }) =>
    api.get<ProductListResponse>("/products", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Product & { relatedProducts: Product[] }>(`/products/${id}`).then((r) => r.data),
};

// Cart
export const cartApi = {
  get: () => api.get<{ items: CartItem[]; total: number }>("/cart").then((r) => r.data),
  add: (productId: string, quantity: number) =>
    api.post<CartItem>("/cart", { productId, quantity }).then((r) => r.data),
};

// Wishlist
export const wishlistApi = {
  get: () => api.get<{ items: WishlistItem[] }>("/wishlist").then((r) => r.data),
  add: (productId: string) =>
    api.post<WishlistItem>("/wishlist", { productId }).then((r) => r.data),
};

// Orders
export const ordersApi = {
  create: (shippingAddress: ShippingAddress) =>
    api.post<Order>("/orders", { shippingAddress }).then((r) => r.data),
};

export default api;
