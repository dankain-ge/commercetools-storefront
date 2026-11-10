import type { Cart as CtCart, LineItem as CtLineItem, Address as CtAddress, Order as CtOrder, DiscountCode as CtDiscountCode } from '@commercetools/platform-sdk';
import type { Cart, LineItem, Address, Order } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { mapMoney } from './money';
import { mapPrice } from './product';

export function mapAddress(a: CtAddress | undefined): Address | undefined {
  if (!a) return undefined;
  return {
    id: a.id, firstName: a.firstName, lastName: a.lastName, streetName: a.streetName, streetNumber: a.streetNumber,
    postalCode: a.postalCode, city: a.city, country: a.country, state: a.state, phone: a.phone, email: a.email,
  };
}

export function mapLineItem(li: CtLineItem, locale: string): LineItem {
  return {
    id: li.id,
    productId: li.productId,
    variantId: li.variant.id,
    sku: li.variant.sku ?? '',
    name: getLocalizedString(li.name, locale),
    slug: li.productSlug ? getLocalizedString(li.productSlug, locale) : '',
    image: li.variant.images?.[0]?.url,
    quantity: li.quantity,
    price: mapPrice(li.price)!,
    totalPrice: mapMoney(li.totalPrice),
  };
}

export function mapCart(c: CtCart, locale: string): Cart {
  const lineItems = c.lineItems.map((li) => mapLineItem(li, locale));
  // Pre-cart-discount subtotal: unit price (after product discounts) × quantity. li.totalPrice already has cart discounts applied.
  const subtotalCents = c.lineItems.reduce((sum, li) => sum + (li.price.discounted?.value.centAmount ?? li.price.value.centAmount) * li.quantity, 0);
  return {
    id: c.id,
    version: c.version,
    state: c.cartState,
    currencyCode: c.totalPrice.currencyCode,
    country: c.country,
    customerId: c.customerId,
    lineItems,
    totalLineItemQuantity: c.totalLineItemQuantity ?? lineItems.reduce((s, li) => s + li.quantity, 0),
    subtotal: { ...mapMoney(c.totalPrice), centAmount: subtotalCents },
    totalPrice: mapMoney(c.totalPrice),
    discountCodes: c.discountCodes.map((d) => ({
      id: d.discountCode.id,
      code: (d.discountCode.obj as CtDiscountCode | undefined)?.code ?? '',
      state: d.state,
    })),
    shippingAddress: mapAddress(c.shippingAddress),
  };
}

export function mapOrder(o: CtOrder, locale: string): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    orderState: o.orderState,
    paymentState: o.paymentState,
    shipmentState: o.shipmentState,
    totalPrice: mapMoney(o.totalPrice),
    lineItems: o.lineItems.map((li) => mapLineItem(li, locale)),
    shippingAddress: mapAddress(o.shippingAddress),
    customerEmail: o.customerEmail,
  };
}
