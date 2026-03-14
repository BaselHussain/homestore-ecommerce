import axios from "axios";
import type { ShippingAddress, Order, ProductListResponse } from "./types";
import type { Product } from "./products-mock";
import { getToken, clearAuthData } from "./auth";
import { getImageUrl } from "./utils";

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

// Maps a raw backend product to the frontend display Product type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProduct(raw: any): Product {
  const images: string[] = Array.isArray(raw.images) ? raw.images : [];
  const fallback = "/images/category-household.jpg";
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: parseFloat(raw.price),
    originalPrice: raw.originalPrice != null ? parseFloat(raw.originalPrice) : undefined,
    image: getImageUrl(images[0] || fallback),
    images: images.map(getImageUrl),
    category: raw.category,
    badge: (raw.badge as Product["badge"]) || undefined,
    rating: raw.rating != null ? parseFloat(raw.rating) : 0,
    reviews: raw.reviews ?? 0,
    itemCode: raw.itemCode ?? "",
    stock: raw.stock,
  };
}

// Products
export const productsApi = {
  getAll: (params?: { search?: string; category?: string; sort?: string; page?: number; limit?: number }) =>
    api.get<{ data: unknown[]; pagination: ProductListResponse["pagination"] }>("/products", { params }).then((r) => ({
      data: r.data.data.map(mapProduct),
      pagination: r.data.pagination,
    } satisfies ProductListResponse)),

  getById: (id: string) =>
    api.get<unknown>(`/products/${id}`).then((r) => mapProduct(r.data)),
};


// Coupons (public validate — uses plain fetch to avoid auth interceptors)
export const couponsApi = {
  validate: async (code: string, subtotal: number): Promise<{ valid: true; code: string; discountType: string; discountValue: number; discountAmount: number; finalTotal: number } | { valid: false; error: string; message: string; minOrderValue?: number }> => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';
    const res = await fetch(`${base}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return res.json();
  },
};

// Orders
export const ordersApi = {
  create: (data: {
    shippingAddress: ShippingAddress;
    guestEmail?: string;
    items?: Array<{ productId: string; name: string; price: number; quantity: number }>;
    total?: number;
    couponCode?: string;
    discountAmount?: number;
  }) => api.post<Order>("/orders", data).then((r) => r.data),

  track: (orderId: string, email: string) =>
    api.get<{ success: boolean; order: unknown }>("/orders/track", { params: { orderId, email } }).then((r) => r.data),
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
    api.get<{ success: boolean; user: { id: string; email: string; name: string; addresses: unknown[] } }>(
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
    api.get<{ success: boolean; orders: unknown[] }>("/users/orders").then((r) => r.data),

  addAddress: (data: { label?: string; street: string; city: string; state: string; zipCode: string; country?: string; isDefault?: boolean }) =>
    api.post<{ success: boolean; address: unknown }>("/users/addresses", data).then((r) => r.data),

  deleteAddress: (id: string) =>
    api.delete<{ success: boolean }>(`/users/addresses/${id}`).then((r) => r.data),
};

export default api;
