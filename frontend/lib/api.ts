import axios from "axios";
import type { Product, CartItem, WishlistItem, Order, ShippingAddress, ProductListResponse } from "./types";
import { getToken, clearAuthData } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 by clearing auth and redirecting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    const message = error.response?.data?.error || error.response?.data?.message || "An error occurred";
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
  create: (data: {
    shippingAddress: ShippingAddress;
    guestEmail?: string;
    items?: Array<{ productId: string; name: string; price: number; quantity: number }>;
    total?: number;
  }) => api.post<Order>("/orders", data).then((r) => r.data),
};

// Auth
export const authApi = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post<{ success: boolean; message: string }>("/auth/signup", data).then((r) => r.data),

  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<{ success: boolean; token: string; user: { id: string; email: string; name: string } }>(
      "/auth/login", data
    ).then((r) => r.data),

  logout: () =>
    api.post<{ success: boolean }>("/auth/logout").then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string }>("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ success: boolean; message: string }>("/auth/reset-password", { token, newPassword }).then((r) => r.data),
};

// User profile
export const userApi = {
  getProfile: () =>
    api.get<{ success: boolean; user: { id: string; email: string; name: string; addresses: any[] } }>(
      "/users/profile"
    ).then((r) => r.data),

  updateProfile: (data: { name?: string; email?: string }) =>
    api.put<{ success: boolean; user: { id: string; email: string; name: string } }>(
      "/users/profile", data
    ).then((r) => r.data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ success: boolean; message: string }>(
      "/users/password", { currentPassword, newPassword }
    ).then((r) => r.data),

  getOrders: () =>
    api.get<{ success: boolean; orders: any[] }>("/users/orders").then((r) => r.data),

  addAddress: (data: { label?: string; street: string; city: string; state: string; zipCode: string; country?: string; isDefault?: boolean }) =>
    api.post<{ success: boolean; address: any }>("/users/addresses", data).then((r) => r.data),

  deleteAddress: (id: string) =>
    api.delete<{ success: boolean }>(`/users/addresses/${id}`).then((r) => r.data),
};

export default api;
