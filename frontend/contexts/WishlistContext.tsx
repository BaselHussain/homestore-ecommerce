'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Product } from '@/lib/products-mock';
import { useWishlistStore } from '@/lib/wishlist-store';

export interface WishlistItem {
  product: Product;
}

interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const store = useWishlistStore();

  return (
    <WishlistContext.Provider value={{
      items: store.items.map(i => ({ product: i.product })),
      isInWishlist: store.isInWishlist,
      addItem: store.addItem,
      removeItem: store.removeItem,
      count: store.wishlistCount(),
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
