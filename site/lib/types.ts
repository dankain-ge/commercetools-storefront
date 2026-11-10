// App-level boundary types. Components import from here — never from @commercetools/platform-sdk.

export interface Money {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
}

export interface Price {
  value: Money;
  discounted?: Money;
}

export interface Variant {
  id: number;
  sku: string;
  key?: string;
  images: string[];
  price?: Price;
  attributes: Record<string, unknown>;
  isOnStock: boolean;
}

export interface Product {
  id: string;
  key?: string;
  name: string;
  slug: string;
  description?: string;
  categoryIds: string[];
  productTypeId: string;
  variants: Variant[]; // master variant first
}

export interface Category {
  id: string;
  key?: string;
  name: string;
  slug: string;
  parentId?: string;
  children: Category[];
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface FacetBucket {
  key: string;
  label: string;
  count: number;
}

export interface Facet {
  name: string;
  label: string;
  kind: 'distinct' | 'ranges';
  buckets: FacetBucket[];
}

export interface SearchResult {
  products: Product[];
  total: number;
  offset: number;
  limit: number;
  facets: Facet[];
}

export type SortOption = 'relevance' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export interface LineItem {
  id: string;
  productId: string;
  variantId: number;
  sku: string;
  name: string;
  slug: string;
  image?: string;
  quantity: number;
  price: Price;
  totalPrice: Money;
}

export interface DiscountCode {
  id: string;
  code: string;
  state: string;
}

export interface Address {
  id?: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  country: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface Cart {
  id: string;
  version: number;
  state: string;
  currencyCode: string;
  country?: string;
  customerId?: string;
  lineItems: LineItem[];
  totalLineItemQuantity: number;
  subtotal: Money;
  totalPrice: Money;
  discountCodes: DiscountCode[];
  shippingAddress?: Address;
}

export interface Account {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  orderState: string;
  paymentState?: string;
  shipmentState?: string;
  totalPrice: Money;
  lineItems: LineItem[];
  shippingAddress?: Address;
  customerEmail?: string;
}
