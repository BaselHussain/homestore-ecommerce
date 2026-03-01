// Re-export the canonical Product type from products-mock (display type)
export type { Product } from './products-mock';
import type { Product } from './products-mock';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  addedAt: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product?: Product;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
  shippingAddress: ShippingAddress;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
}

export interface CartState {
  items: (CartItem & { product: Product })[];
  subtotal: number;
}

export interface WishlistState {
  items: (WishlistItem & { product: Product })[];
}
