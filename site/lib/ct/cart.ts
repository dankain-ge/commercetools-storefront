import 'server-only';
import type { Cart as CtCart, CartUpdateAction, ClientResponse } from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { mapCart } from '@/lib/mappers/cart';
import type { Cart } from '@/lib/types';

const EXPAND = ['discountCodes[*].discountCode'];

async function fetchRaw(cartId: string): Promise<CtCart> {
  const { body } = await apiRoot.carts().withId({ ID: cartId }).get({ queryArgs: { expand: EXPAND } }).execute();
  return body;
}

export async function getCart(cartId: string, locale: string): Promise<Cart> {
  return mapCart(await fetchRaw(cartId), locale);
}

export interface CreateCartInput { currency: string; country: string; locale: string; customerId?: string; customerEmail?: string }

export async function createCart(input: CreateCartInput): Promise<Cart> {
  const { body } = await apiRoot.carts().post({
    body: {
      currency: input.currency,
      country: input.country,
      locale: input.locale,
      shippingMode: 'Single',
      ...(input.customerId && { customerId: input.customerId }),
      ...(input.customerEmail && { customerEmail: input.customerEmail }),
    },
  }).execute();
  return mapCart(body, input.locale);
}

function isConflict(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'statusCode' in e && (e as { statusCode?: number }).statusCode === 409;
}

/** Re-fetches the current version and retries once on a 409 ConcurrentModification. */
async function updateCart(cartId: string, actions: CartUpdateAction[], locale: string): Promise<Cart> {
  const attempt = async (): Promise<ClientResponse<CtCart>> => {
    const current = await fetchRaw(cartId);
    return apiRoot.carts().withId({ ID: cartId }).post({ body: { version: current.version, actions }, queryArgs: { expand: EXPAND } }).execute();
  };
  try {
    return mapCart((await attempt()).body, locale);
  } catch (e) {
    if (!isConflict(e)) throw e;
    return mapCart((await attempt()).body, locale);
  }
}

export function addLineItem(cartId: string, sku: string, quantity: number, locale: string) {
  return updateCart(cartId, [{ action: 'addLineItem', sku, quantity }], locale);
}

export function changeLineItemQuantity(cartId: string, lineItemId: string, quantity: number, locale: string) {
  return updateCart(cartId, [{ action: 'changeLineItemQuantity', lineItemId, quantity }], locale);
}

export function removeLineItem(cartId: string, lineItemId: string, locale: string) {
  return updateCart(cartId, [{ action: 'removeLineItem', lineItemId }], locale);
}

export function addDiscountCode(cartId: string, code: string, locale: string) {
  return updateCart(cartId, [{ action: 'addDiscountCode', code }], locale);
}

export function removeDiscountCode(cartId: string, discountCodeId: string, locale: string) {
  return updateCart(cartId, [{ action: 'removeDiscountCode', discountCode: { typeId: 'discount-code', id: discountCodeId } }], locale);
}

export function setCustomerEmail(cartId: string, email: string, locale: string) {
  return updateCart(cartId, [{ action: 'setCustomerEmail', email }], locale);
}

/** Message from a commercetools error body, suitable to show to the customer. */
export function ctErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === 'object' && e !== null) {
    const err = e as { body?: { message?: string; errors?: Array<{ message?: string }> }; message?: string };
    return err.body?.errors?.[0]?.message ?? err.body?.message ?? err.message ?? fallback;
  }
  return fallback;
}

/** Error code from a commercetools error body, e.g. 'DuplicateField', 'InvalidCredentials'. */
export function ctErrorCode(e: unknown): string | undefined {
  if (typeof e === 'object' && e !== null) {
    const err = e as { body?: { errors?: Array<{ code?: string }> } };
    return err.body?.errors?.[0]?.code;
  }
  return undefined;
}
