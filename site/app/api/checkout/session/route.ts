import { NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getCart, setCustomerEmail } from '@/lib/ct/cart';
import { createCheckoutSession } from '@/lib/ct/checkout-session';

/** POST — creates a Checkout Session for the current cart. Called as late as possible (on the checkout page). */
export async function POST() {
  const [session, { locale, currency }] = await Promise.all([getSession(), getLocale()]);
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 404 });
  try {
    const cart = await getCart(session.cartId, locale);
    if (cart.state !== 'Active' || cart.lineItems.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 409 });
    if (cart.currencyCode !== currency) return NextResponse.json({ error: 'Cart currency does not match the selected country' }, { status: 409 });
    if (session.customerEmail && !cart.customerId) await setCustomerEmail(cart.id, session.customerEmail, locale).catch(() => undefined);
    const checkout = await createCheckoutSession(cart.id);
    return NextResponse.json(checkout);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not start checkout' }, { status: 500 });
  }
}
