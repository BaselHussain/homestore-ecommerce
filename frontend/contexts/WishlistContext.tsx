'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Product } from '@/lib/products-mock';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistApi, mapProduct } from '@/lib/api';

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const zustand = useWishlistStore();

  // Backend wishlist state
  const [backendItems, setBackendItems] = useState<WishlistItem[]>([]);
  // Maps productId → wishlist item DB id (for remove API calls)
  const [wishlistItemIdMap, setWishlistItemIdMap] = useState<Map<string, string>>(new Map());

  const fetchBackendWishlist = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await wishlistApi.get() as { items: any[] };
      const items: WishlistItem[] = data.items.map((item) => ({
        product: mapProduct(item.product),
      }));
      setBackendItems(items);
      const idMap = new Map<string, string>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.items.forEach((item: any) => {
        idMap.set(item.product.id, item.id);
      });
      setWishlistItemIdMap(idMap);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBackendWishlist();
    } else if (!isAuthenticated) {
      setBackendItems([]);
      setWishlistItemIdMap(new Map());
    }
  }, [isAuthenticated, authLoading, fetchBackendWishlist]);

  const addItem = useCallback((product: Product) => {
    if (isAuthenticated) {
      wishlistApi.add(product.id)
        .then(() => fetchBackendWishlist())
        .catch(() => {});
    } else {
      zustand.addItem(product);
    }
  }, [isAuthenticated, fetchBackendWishlist, zustand]);

  const removeItem = useCallback((productId: string) => {
    if (isAuthenticated) {
      const wishlistItemId = wishlistItemIdMap.get(productId);
      if (wishlistItemId) {
        wishlistApi.remove(wishlistItemId)
          .then(() => fetchBackendWishlist())
          .catch(() => {});
      }
    } else {
      zustand.removeItem(productId);
    }
  }, [isAuthenticated, wishlistItemIdMap, fetchBackendWishlist, zustand]);

  const isInWishlist = useCallback((productId: string): boolean => {
    if (isAuthenticated) {
      return wishlistItemIdMap.has(productId);
    }
    return zustand.isInWishlist(productId);
  }, [isAuthenticated, wishlistItemIdMap, zustand]);

  const items = isAuthenticated
    ? backendItems
    : zustand.items.map((i) => ({ product: i.product }));

  return (
    <WishlistContext.Provider value={{
      items,
      isInWishlist,
      addItem,
      removeItem,
      count: items.length,
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
