'use client';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useCartSWR, useCartMutations, type CartMutations } from '@/hooks/useCart';
import type { Cart } from '@/lib/types';

interface CartContextValue {
  cart: Cart | null | undefined;
  isLoading: boolean;
  itemCount: number;
  showMiniCart: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addToCart: (sku: string, quantity?: number) => Promise<void>;
  mutateCart: CartMutations;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: cart, isLoading } = useCartSWR();
  const mutateCart = useCartMutations();
  const [showMiniCart, setShowMiniCart] = useState(false);

  const addToCart = useCallback(async (sku: string, quantity = 1) => {
    await mutateCart.addItem(sku, quantity);
    setShowMiniCart(true);
  }, [mutateCart]);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    isLoading,
    itemCount: cart?.totalLineItemQuantity ?? 0,
    showMiniCart,
    openMiniCart: () => setShowMiniCart(true),
    closeMiniCart: () => setShowMiniCart(false),
    addToCart,
    mutateCart,
  }), [cart, isLoading, showMiniCart, addToCart, mutateCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}
