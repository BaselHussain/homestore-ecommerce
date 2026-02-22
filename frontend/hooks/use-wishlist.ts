'use client';

import { useWishlistStore } from '@/lib/wishlist-store';

export function useWishlistHook() {
  const store = useWishlistStore();

  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    isInWishlist: store.isInWishlist,
    clearWishlist: store.clearWishlist,
    wishlistCount: store.wishlistCount(),
    isEmpty: store.items.length === 0,
  };
}

export { useWishlistStore };
