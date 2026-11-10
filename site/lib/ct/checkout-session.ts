import 'server-only';
import { apiUrl, authUrl, projectKey } from './client';

// The Checkout Sessions API is not part of @commercetools/platform-sdk, so this module
// talks to it directly. It is the one place in lib/ct that uses raw fetch.

const APP_KEY = process.env.CTP_CHECKOUT_APP_KEY!;
if (!APP_KEY) throw new Error('Missing environment variable CTP_CHECKOUT_APP_KEY');

/** https://api.europe-west1.gcp.commercetools.com → europe-west1.gcp */
export const REGION = apiUrl.replace(/^https?:\/\/api\./, '').replace(/\.commercetools\.com\/?$/, '');

let cached: { token: string; expiresAt: number } | null = null;

async function getSessionsToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const basic = Buffer.from(`${process.env.CTP_CLIENT_ID}:${process.env.CTP_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${authUrl}/oauth/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: `manage_sessions:${projectKey}` }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

export interface CheckoutSession { sessionId: string; projectKey: string; region: string }

export async function createCheckoutSession(cartId: string): Promise<CheckoutSession> {
  const token = await getSessionsToken();
  const res = await fetch(`https://session.${REGION}.commercetools.com/${projectKey}/sessions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart: { cartRef: { id: cartId } }, metadata: { applicationKey: APP_KEY } }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Checkout session creation failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id: string };
  return { sessionId: data.id, projectKey, region: REGION };
}
