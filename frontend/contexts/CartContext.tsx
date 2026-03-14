'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Product } from '@/lib/products-mock';
import { useCartStore } from '@/lib/cart-store';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const store = useCartStore();

  return (
    <CartContext.Provider value={{
      items: store.items,
      addToCart: store.addItem,
      removeFromCart: store.removeItem,
      updateQuantity: store.updateQuantity,
      clearCart: store.clearCart,
      totalItems: store.cartCount(),
      totalPrice: store.subtotal(),
      isLoading: false,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
