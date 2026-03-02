'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Product } from '@/lib/products-mock';
import { useCartStore } from '@/lib/cart-store';
import { useAuth } from '@/contexts/AuthContext';
import { cartApi, mapProduct } from '@/lib/api';

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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const zustand = useCartStore();

  // Backend cart state (only used for authenticated users)
  const [backendItems, setBackendItems] = useState<CartItem[]>([]);
  // Maps productId → cart item DB id (for update/remove API calls)
  const [cartItemIdMap, setCartItemIdMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchBackendCart = useCallback(async () => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await cartApi.get() as { items: any[]; total: number };
      const items: CartItem[] = data.items.map((item) => ({
        product: mapProduct(item.product),
        quantity: item.quantity,
      }));
      setBackendItems(items);
      const idMap = new Map<string, string>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.items.forEach((item: any) => {
        idMap.set(item.product.id, item.id);
      });
      setCartItemIdMap(idMap);
    } catch {
      // silently fail — user sees empty cart
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBackendCart();
    } else if (!isAuthenticated) {
      setBackendItems([]);
      setCartItemIdMap(new Map());
    }
  }, [isAuthenticated, authLoading, fetchBackendCart]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (isAuthenticated) {
      // Optimistic: update UI immediately
      setBackendItems(prev => {
        const existing = prev.find(i => i.product.id === product.id);
        if (existing) {
          return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, { product, quantity }];
      });
      // Sync in background; refetch to get new item's DB id (needed for remove/update)
      cartApi.add(product.id, quantity)
        .then(() => fetchBackendCart())
        .catch(() => fetchBackendCart());
    } else {
      zustand.addItem(product, quantity);
    }
  }, [isAuthenticated, fetchBackendCart, zustand]);

  const removeFromCart = useCallback((productId: string) => {
    if (isAuthenticated) {
      const cartItemId = cartItemIdMap.get(productId);
      if (cartItemId) {
        // Optimistic: remove immediately
        setBackendItems(prev => prev.filter(i => i.product.id !== productId));
        cartApi.remove(cartItemId)
          .catch(() => fetchBackendCart()); // revert on failure
      }
    } else {
      zustand.removeItem(productId);
    }
  }, [isAuthenticated, cartItemIdMap, fetchBackendCart, zustand]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (isAuthenticated) {
      const cartItemId = cartItemIdMap.get(productId);
      if (cartItemId) {
        // Optimistic: update immediately
        setBackendItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
        cartApi.update(cartItemId, quantity)
          .catch(() => fetchBackendCart()); // revert on failure
      }
    } else {
      zustand.updateQuantity(productId, quantity);
    }
  }, [isAuthenticated, cartItemIdMap, fetchBackendCart, zustand, removeFromCart]);

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      setBackendItems([]);
      setCartItemIdMap(new Map());
    } else {
      zustand.clearCart();
    }
  }, [isAuthenticated, zustand]);

  const items = isAuthenticated ? backendItems : zustand.items;
  const totalItems = isAuthenticated
    ? backendItems.reduce((sum, i) => sum + i.quantity, 0)
    : zustand.cartCount();
  const totalPrice = isAuthenticated
    ? backendItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    : zustand.subtotal();

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isLoading,
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
