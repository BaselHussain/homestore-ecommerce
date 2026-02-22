'use client';

import { useCartStore } from '@/lib/cart-store';

export function useCartHook() {
  const store = useCartStore();

  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    cartCount: store.cartCount(),
    subtotal: store.subtotal(),
    isEmpty: store.items.length === 0,
  };
}

export { useCartStore };
