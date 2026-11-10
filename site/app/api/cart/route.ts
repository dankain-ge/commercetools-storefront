import { NextResponse } from 'next/server';
import { getSession, getLocale, jsonWithSession } from '@/lib/session';
import { getCart, createCart } from '@/lib/ct/cart';

/** GET /api/cart — the session-hygiene endpoint: drops ordered, missing or wrong-currency carts. */
export async function GET() {
  const [session, { locale, currency }] = await Promise.all([getSession(), getLocale()]);
  if (!session.cartId) return NextResponse.json({ cart: null });
  try {
    const cart = await getCart(session.cartId, locale);
    if (cart.state !== 'Active' || cart.currencyCode !== currency) {
      return jsonWithSession({ cart: null }, { ...session, cartId: undefined });
    }
    return NextResponse.json({ cart });
  } catch (e) {
    // Only a 404 means the cart is really gone. Anything else is transient: keep the cartId and report the failure.
    const status = typeof e === 'object' && e !== null && 'statusCode' in e ? (e as { statusCode?: number }).statusCode : undefined;
    if (status === 404) return jsonWithSession({ cart: null }, { ...session, cartId: undefined });
    console.error('[api/cart] failed to load cart', session.cartId, e);
    return NextResponse.json({ cart: null, error: 'Could not load cart' }, { status: 503 });
  }
}

/** POST /api/cart — create a cart for the current locale if none exists. */
export async function POST() {
  const [session, cfg] = await Promise.all([getSession(), getLocale()]);
  try {
    if (session.cartId) {
      const existing = await getCart(session.cartId, cfg.locale).catch(() => null);
      if (existing && existing.state === 'Active' && existing.currencyCode === cfg.currency) return NextResponse.json({ cart: existing });
    }
    const cart = await createCart({ ...cfg, customerId: session.customerId, customerEmail: session.customerEmail });
    return jsonWithSession({ cart }, { ...session, cartId: cart.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to create cart' }, { status: 500 });
  }
}
