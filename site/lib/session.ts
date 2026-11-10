import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { configForLocale, LOCALE_COOKIE, type CountryConfig } from '@/lib/utils';

const RAW_SECRET = process.env.SESSION_SECRET;
if (!RAW_SECRET || RAW_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be set and at least 32 characters long');
}
const SECRET = new TextEncoder().encode(RAW_SECRET);
const COOKIE_NAME = 'ct-storefront-session';
const MAX_AGE = 30 * 24 * 60 * 60;

export interface Session {
  customerId?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  cartId?: string;
}

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return {};
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { iat: _iat, exp: _exp, ...session } = payload as Session & { iat?: number; exp?: number };
    void _iat; void _exp;
    return session;
  } catch {
    return {};
  }
}

/** Resolves country / currency / locale from the locale cookie written by proxy.ts. */
export async function getLocale(): Promise<CountryConfig> {
  const store = await cookies();
  return configForLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function createSessionToken(data: Session): Promise<string> {
  return new SignJWT(data as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', maxAge: MAX_AGE, path: '/' });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', maxAge: 0, path: '/' });
  return response;
}

/** Convenience: build a JSON response and persist the given session on it. */
export async function jsonWithSession(body: unknown, session: Session, init?: ResponseInit): Promise<NextResponse> {
  const res = NextResponse.json(body, init);
  return setSessionCookie(res, await createSessionToken(session));
}
