import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale, jsonWithSession, type Session } from '@/lib/session';
import { getCart, createCart, addLineItem, changeLineItemQuantity, removeLineItem, ctErrorMessage } from '@/lib/ct/cart';
import type { CountryConfig } from '@/lib/utils';

async function ensureCartId(session: Session, cfg: CountryConfig): Promise<{ cartId: string; created: boolean }> {
  if (session.cartId) {
    const existing = await getCart(session.cartId, cfg.locale).catch(() => null);
    if (existing && existing.state === 'Active' && existing.currencyCode === cfg.currency) return { cartId: existing.id, created: false };
  }
  const cart = await createCart({ ...cfg, customerId: session.customerId, customerEmail: session.customerEmail });
  return { cartId: cart.id, created: true };
}

/** POST { sku, quantity } — add to cart, creating the cart on demand. */
export async function POST(req: NextRequest) {
  const { sku, quantity = 1 } = (await req.json().catch(() => ({}))) as { sku?: string; quantity?: number };
  if (!sku) return NextResponse.json({ error: 'sku is required' }, { status: 400 });
  const [session, cfg] = await Promise.all([getSession(), getLocale()]);
  try {
    const { cartId, created } = await ensureCartId(session, cfg);
    const cart = await addLineItem(cartId, sku, Math.max(1, Number(quantity) || 1), cfg.locale);
    return created || session.cartId !== cartId ? jsonWithSession({ cart }, { ...session, cartId }) : NextResponse.json({ cart });
  } catch (e) {
    return NextResponse.json({ error: ctErrorMessage(e, 'Could not add item to cart') }, { status: 500 });
  }
}

/** PATCH { lineItemId, quantity } */
export async function PATCH(req: NextRequest) {
  const { lineItemId, quantity } = (await req.json().catch(() => ({}))) as { lineItemId?: string; quantity?: number };
  if (!lineItemId || typeof quantity !== 'number') return NextResponse.json({ error: 'lineItemId and quantity are required' }, { status: 400 });
  const [session, { locale }] = await Promise.all([getSession(), getLocale()]);
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 404 });
  try {
    const cart = quantity <= 0
      ? await removeLineItem(session.cartId, lineItemId, locale)
      : await changeLineItemQuantity(session.cartId, lineItemId, quantity, locale);
    return NextResponse.json({ cart });
  } catch (e) {
    return NextResponse.json({ error: ctErrorMessage(e, 'Could not update item') }, { status: 500 });
  }
}

/** DELETE { lineItemId } */
export async function DELETE(req: NextRequest) {
  const { lineItemId } = (await req.json().catch(() => ({}))) as { lineItemId?: string };
  if (!lineItemId) return NextResponse.json({ error: 'lineItemId is required' }, { status: 400 });
  const [session, { locale }] = await Promise.all([getSession(), getLocale()]);
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 404 });
  try {
    const cart = await removeLineItem(session.cartId, lineItemId, locale);
    return NextResponse.json({ cart });
  } catch (e) {
    return NextResponse.json({ error: ctErrorMessage(e, 'Could not remove item') }, { status: 500 });
  }
}
