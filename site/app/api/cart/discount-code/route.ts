import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { addDiscountCode, removeDiscountCode, ctErrorMessage } from '@/lib/ct/cart';

export async function POST(req: NextRequest) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code?.trim()) return NextResponse.json({ error: 'code is required' }, { status: 400 });
  const [session, { locale }] = await Promise.all([getSession(), getLocale()]);
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 404 });
  try {
    const cart = await addDiscountCode(session.cartId, code.trim(), locale);
    const applied = cart.discountCodes.find((d) => d.code.toLowerCase() === code.trim().toLowerCase());
    if (applied && applied.state !== 'MatchesCart') {
      return NextResponse.json({ cart, error: `Code "${code}" does not apply to this cart (${applied.state}).` }, { status: 422 });
    }
    return NextResponse.json({ cart });
  } catch (e) {
    return NextResponse.json({ error: ctErrorMessage(e, 'Invalid discount code') }, { status: 422 });
  }
}

export async function DELETE(req: NextRequest) {
  const { discountCodeId } = (await req.json().catch(() => ({}))) as { discountCodeId?: string };
  if (!discountCodeId) return NextResponse.json({ error: 'discountCodeId is required' }, { status: 400 });
  const [session, { locale }] = await Promise.all([getSession(), getLocale()]);
  if (!session.cartId) return NextResponse.json({ error: 'No cart' }, { status: 404 });
  try {
    const cart = await removeDiscountCode(session.cartId, discountCodeId, locale);
    return NextResponse.json({ cart });
  } catch (e) {
    return NextResponse.json({ error: ctErrorMessage(e, 'Could not remove discount code') }, { status: 500 });
  }
}
