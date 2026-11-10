import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST() {
  // Locale lives in its own cookie, so clearing the session keeps the shopper's country.
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
