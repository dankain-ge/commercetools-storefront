import type { ProductProjection, ProductVariant, Price as CtPrice, Attribute } from '@commercetools/platform-sdk';
import type { Product, Variant, Price } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';
import { mapMoney } from './money';

export function mapPrice(p: CtPrice | undefined): Price | undefined {
  if (!p) return undefined;
  return { value: mapMoney(p.value), discounted: p.discounted ? mapMoney(p.discounted.value) : undefined };
}

function mapAttributes(attrs: Attribute[] | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const a of attrs ?? []) out[a.name] = a.value;
  return out;
}

export function mapVariant(v: ProductVariant): Variant {
  return {
    id: v.id,
    sku: v.sku ?? '',
    key: v.key,
    images: (v.images ?? []).map((i) => i.url),
    price: mapPrice(v.price),
    attributes: mapAttributes(v.attributes),
    isOnStock: v.availability?.isOnStock ?? true,
  };
}

export function mapProduct(p: ProductProjection, locale: string): Product {
  return {
    id: p.id,
    key: p.key,
    name: getLocalizedString(p.name, locale),
    slug: getLocalizedString(p.slug, locale),
    description: getLocalizedString(p.description, locale) || undefined,
    categoryIds: p.categories.map((c) => c.id),
    productTypeId: p.productType.id,
    variants: [mapVariant(p.masterVariant), ...p.variants.map(mapVariant)],
  };
}
