import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/products-mock';

export interface WishlistStoreItem {
  product: Product;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistStoreItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) return state;
          return {
            items: [...state.items, { product, addedAt: new Date().toISOString() }],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      isInWishlist: (productId: string) => {
        return get().items.some((i) => i.product.id === productId);
      },

      clearWishlist: () => set({ items: [] }),

      wishlistCount: () => get().items.length,
    }),
    {
      name: 'homestore-wishlist',
    }
  )
);
