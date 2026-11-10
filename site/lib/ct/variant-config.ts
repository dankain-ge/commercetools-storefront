export type VariantRenderer = 'pill' | 'color';

/** Attribute names never shown as PDP selectors. */
export const VARIANT_SELECTOR_BLOCKLIST: string[] = [
  'color-code', 'finish-code', 'search-color', 'search-finish',
  'productspec', 'product-description', 'product-spec', 'product-ref', 'new-arrival', 'type',
];

export const VARIANT_RENDERER_MAP: Record<string, VariantRenderer> = {
  'color-label': 'color',
  'finish-label': 'color',
  'size': 'pill',
};

export const VARIANT_COLOR_CODE_ATTR: Record<string, string> = {
  'color-label': 'color-code',
  'finish-label': 'finish-code',
};

export const VARIANT_SORT_ORDER: string[] = ['color-label', 'finish-label', 'size'];

/** Attributes rendered as text blocks under the description. */
export const PDP_INFO_ATTRIBUTES: string[] = ['productspec', 'product-spec'];

/** Searchable attributes that should still not become facets (hex codes, free-text labels). */
export const FACET_BLOCKLIST: string[] = ['color-code', 'finish-code', 'color-label', 'finish-label'];

/** Price facet buckets in minor units (cents). */
export const PRICE_RANGES: Array<{ from?: number; to?: number }> = [
  { from: 0, to: 5000 },
  { from: 5000, to: 15000 },
  { from: 15000, to: 50000 },
  { from: 50000, to: 150000 },
  { from: 150000 },
];
