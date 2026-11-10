'use client';
import useSWR, { useSWRConfig } from 'swr';
import { KEY_ACCOUNT, KEY_CART, KEY_ORDERS } from '@/lib/cache-keys';
import type { Account, Order } from '@/lib/types';

async function fetchAccount(): Promise<Account | null> {
  const res = await fetch('/api/account/profile');
  if (!res.ok) return null;
  return ((await res.json()) as { customer: Account | null }).customer;
}

export function useAccount() {
  const { data, isLoading, mutate } = useSWR<Account | null>(KEY_ACCOUNT, fetchAccount, { revalidateOnFocus: false });
  return { user: data, isLoading: isLoading || data === undefined, mutate };
}

async function post(url: string, body?: unknown): Promise<Account> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = (await res.json().catch(() => ({}))) as { customer?: Account; error?: string };
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data.customer as Account;
}

export function useAuth() {
  const { mutate } = useSWRConfig();
  const afterAuth = async (customer: Account) => {
    await mutate(KEY_ACCOUNT, customer, { revalidate: false });
    await mutate(KEY_CART); // the cart may have been merged
    await mutate(KEY_ORDERS, undefined, { revalidate: false });
  };
  return {
    login: async (email: string, password: string) => { const c = await post('/api/auth/login', { email, password }); await afterAuth(c); return c; },
    register: async (input: { email: string; password: string; firstName?: string; lastName?: string }) => { const c = await post('/api/auth/register', input); await afterAuth(c); return c; },
    logout: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      await mutate(KEY_ACCOUNT, null, { revalidate: false });
      await mutate(KEY_CART, null, { revalidate: false });
      await mutate(KEY_ORDERS, undefined, { revalidate: false });
    },
  };
}

export function useOrders(enabled: boolean) {
  return useSWR<Order[]>(enabled ? KEY_ORDERS : null, async () => {
    const res = await fetch('/api/account/orders');
    if (!res.ok) return [];
    return ((await res.json()) as { orders: Order[] }).orders ?? [];
  }, { revalidateOnFocus: false });
}
