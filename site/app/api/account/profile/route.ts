import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCustomerById } from '@/lib/ct/auth';

export async function GET() {
  const session = await getSession();
  if (!session.customerId) return NextResponse.json({ customer: null });
  try {
    return NextResponse.json({ customer: await getCustomerById(session.customerId) });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
