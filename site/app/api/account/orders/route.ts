import { NextResponse } from 'next/server';
import { getSession, getLocale } from '@/lib/session';
import { getCustomerOrders } from '@/lib/ct/orders';

export async function GET() {
  const [session, { locale }] = await Promise.all([getSession(), getLocale()]);
  if (!session.customerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ orders: await getCustomerOrders(session.customerId, locale) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load orders' }, { status: 500 });
  }
}
