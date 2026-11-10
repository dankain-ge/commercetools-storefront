'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_CART } from '@/lib/cache-keys';
import type { Cart } from '@/lib/types';

async function fetchCart(): Promise<Cart | null> {
  const res = await fetch('/api/cart');
  if (!res.ok) return null;
  return ((await res.json()) as { cart: Cart | null }).cart;
}

export function useCartSWR() {
  return useSWR<Cart | null>(KEY_CART, fetchCart, { revalidateOnFocus: true });
}

async function send(url: string, method: string, body: unknown): Promise<Cart> {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { cart?: Cart; error?: string };
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed') as Error & { cart?: Cart };
    err.cart = data.cart;
    throw err;
  }
  return data.cart as Cart;
}

export function useCartMutations() {
  const { mutate } = useSWRConfig();
  const set = (cart: Cart | null) => mutate(KEY_CART, cart, { revalidate: false });

  return {
    addItem: async (sku: string, quantity = 1) => set(await send('/api/cart/line-items', 'POST', { sku, quantity })),
    updateQuantity: async (lineItemId: string, quantity: number) => set(await send('/api/cart/line-items', 'PATCH', { lineItemId, quantity })),
    removeItem: async (lineItemId: string) => set(await send('/api/cart/line-items', 'DELETE', { lineItemId })),
    applyDiscountCode: async (code: string) => {
      try {
        return await set(await send('/api/cart/discount-code', 'POST', { code }));
      } catch (e) {
        const err = e as Error & { cart?: Cart };
        if (err.cart) await set(err.cart);
        throw err;
      }
    },
    removeDiscountCode: async (discountCodeId: string) => set(await send('/api/cart/discount-code', 'DELETE', { discountCodeId })),
    clear: () => set(null),
    refresh: () => mutate(KEY_CART),
  };
}

export type CartMutations = ReturnType<typeof useCartMutations>;
