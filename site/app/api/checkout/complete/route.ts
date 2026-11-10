import { getSession, jsonWithSession } from '@/lib/session';

/** POST — Checkout signalled checkout_completed; the cart is now an order, so forget its id. */
export async function POST() {
  const session = await getSession();
  return jsonWithSession({ ok: true }, { ...session, cartId: undefined });
}
