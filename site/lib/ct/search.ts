import 'server-only';
import { unstable_cache } from 'next/cache';
import type {
  AttributeDefinition, ProductSearchRequest, ProductSearchFacetExpression, ProductSearchFacetResult,
  ProductSearchFacetResultBucket, SearchFieldType, SearchSorting, _SearchQuery, _SearchQueryExpression,
} from '@commercetools/platform-sdk';
import { apiRoot } from './client';
import { mapProduct } from '@/lib/mappers/product';
import { getLocalizedString } from '@/lib/utils';
import { FACET_BLOCKLIST, PRICE_RANGES } from './variant-config';
import type { Facet, FacetBucket, Product, SearchResult, SortOption } from '@/lib/types';

// ---------- attribute definitions (facet source of truth) ----------

async function fetchAttributeDefinitions(): Promise<AttributeDefinition[]> {
  const { body } = await apiRoot.productTypes().get({ queryArgs: { limit: 500 } }).execute();
  const seen = new Map<string, AttributeDefinition>();
  for (const pt of body.results) for (const a of pt.attributes ?? []) if (!seen.has(a.name)) seen.set(a.name, a);
  return [...seen.values()];
}

export const getAttributeDefinitions = unstable_cache(fetchAttributeDefinitions, ['attribute-definitions'], { revalidate: 3600 });

export async function getAttributeLabels(locale: string): Promise<Record<string, string>> {
  const defs = await getAttributeDefinitions();
  return Object.fromEntries(defs.map((d) => [d.name, getLocalizedString(d.label, locale) || d.name]));
}

// ---------- facet expression building ----------

interface FacetMeta { name: string; label: string; field: string; fieldType: SearchFieldType; kind: 'distinct' | 'ranges'; def?: AttributeDefinition }

function facetFieldType(def: AttributeDefinition): { field: string; fieldType: SearchFieldType } | null {
  const t = def.type;
  const base = t.name === 'set' ? t.elementType : t;
  const prefix = t.name === 'set' ? 'set_' : '';
  const path = `variants.attributes.${def.name}`;
  switch (base.name) {
    case 'enum':
    case 'lenum':
      // (l)enum attributes are addressed by their `.key` subfield and keep their own field type
      return { field: `${path}.key`, fieldType: `${prefix}${base.name}` as SearchFieldType };
    case 'ltext':
    case 'text':
    case 'boolean':
      return { field: path, fieldType: `${prefix}${base.name}` as SearchFieldType };
    default:
      return null; // reference, nested, number/money/date — not facetted in this storefront
  }
}

function buildFacets(defs: AttributeDefinition[], locale: string): { expressions: ProductSearchFacetExpression[]; meta: FacetMeta[] } {
  const meta: FacetMeta[] = [
    { name: 'isOnStock', label: 'In stock', field: 'variants.availability.isOnStock', fieldType: 'boolean', kind: 'distinct' },
    { name: 'price', label: 'Price', field: 'variants.prices.centAmount', fieldType: 'number', kind: 'ranges' },
  ];
  for (const def of defs) {
    if (!def.isSearchable || FACET_BLOCKLIST.includes(def.name)) continue;
    const ft = facetFieldType(def);
    if (!ft) continue;
    meta.push({ name: def.name, label: getLocalizedString(def.label, locale) || def.name, ...ft, kind: 'distinct', def });
  }
  const expressions: ProductSearchFacetExpression[] = meta.map((m) =>
    m.kind === 'ranges'
      ? { ranges: { name: m.name, field: m.field, fieldType: m.fieldType, ranges: PRICE_RANGES } }
      : { distinct: { name: m.name, field: m.field, fieldType: m.fieldType, language: locale, limit: 50 } },
  );
  return { expressions, meta };
}

function parseRange(key: string): { gte?: number; lte?: number } {
  const [from, to] = key.split('-');
  return { gte: from && from !== '*' ? Number(from) : undefined, lte: to && to !== '*' ? Number(to) : undefined };
}

function buildPostFilter(meta: FacetMeta[], filters: Record<string, string>, locale: string): _SearchQuery | undefined {
  const clauses: _SearchQuery[] = [];
  for (const m of meta) {
    const raw = filters[m.name];
    if (!raw) continue;
    if (m.kind === 'ranges') {
      const { gte, lte } = parseRange(raw);
      clauses.push({ range: { field: m.field, fieldType: m.fieldType, ...(gte !== undefined && { gte }), ...(lte !== undefined && { lte }) } });
    } else {
      const values = raw.split(',').filter(Boolean);
      const exacts: _SearchQueryExpression[] = values.map((v) => ({
        exact: { field: m.field, fieldType: m.fieldType, language: locale, value: m.fieldType === 'boolean' ? v === 'true' : v },
      }));
      clauses.push(exacts.length === 1 ? exacts[0] : { or: exacts });
    }
  }
  if (clauses.length === 0) return undefined;
  return clauses.length === 1 ? clauses[0] : { and: clauses };
}

function bucketLabel(m: FacetMeta, key: string, locale: string): string {
  if (m.kind === 'ranges') {
    const { gte, lte } = parseRange(key);
    const fmt = (c: number) => Math.round(c / 100).toString();
    if (gte !== undefined && lte !== undefined) return `${fmt(gte)} – ${fmt(lte)}`;
    if (gte !== undefined) return `${fmt(gte)}+`;
    if (lte !== undefined) return `< ${fmt(lte)}`;
    return key;
  }
  if (m.fieldType === 'boolean') return key === 'true' ? 'Yes' : 'No';
  const t = m.def?.type;
  const base = t?.name === 'set' ? t.elementType : t;
  if (base && (base.name === 'lenum' || base.name === 'enum')) {
    const v = base.values.find((x) => x.key === key);
    if (v) return typeof v.label === 'string' ? v.label : getLocalizedString(v.label, locale);
  }
  return key;
}

function mapFacets(results: ProductSearchFacetResult[] | undefined, meta: FacetMeta[], locale: string): Facet[] {
  const out: Facet[] = [];
  for (const m of meta) {
    const r = results?.find((f) => f.name === m.name) as ProductSearchFacetResultBucket | undefined;
    if (!r || !('buckets' in r)) continue;
    const buckets: FacetBucket[] = r.buckets.filter((b) => b.count > 0).map((b) => ({ key: b.key, count: b.count, label: bucketLabel(m, b.key, locale) }));
    if (buckets.length === 0) continue;
    out.push({ name: m.name, label: m.label, kind: m.kind, buckets });
  }
  return out;
}

// ---------- search ----------

export interface SearchParams {
  text?: string;
  categoryId?: string;
  locale: string;
  currency: string;
  country: string;
  limit?: number;
  offset?: number;
  sort?: SortOption;
  filters?: Record<string, string>;
  withFacets?: boolean;
}

function buildSort(sort: SortOption | undefined, locale: string): SearchSorting[] | undefined {
  switch (sort) {
    case 'name-asc': return [{ field: 'name', language: locale, order: 'asc' }];
    case 'name-desc': return [{ field: 'name', language: locale, order: 'desc' }];
    case 'price-asc': return [{ field: 'variants.prices.centAmount', order: 'asc', mode: 'min' }];
    case 'price-desc': return [{ field: 'variants.prices.centAmount', order: 'desc', mode: 'max' }];
    default: return undefined;
  }
}

export async function searchProducts(params: SearchParams): Promise<SearchResult> {
  const { text, categoryId, locale, currency, country, limit = 24, offset = 0, sort, filters = {}, withFacets = true } = params;

  const parts: _SearchQuery[] = [];
  if (text) parts.push({ fullText: { field: 'name', language: locale, value: text } });
  if (categoryId) parts.push({ exact: { field: 'categoriesSubTree', value: categoryId } });

  const defs = withFacets ? await getAttributeDefinitions() : [];
  const { expressions, meta } = buildFacets(defs, locale);
  const postFilter = buildPostFilter(meta, filters, locale);

  const request: ProductSearchRequest = {
    ...(parts.length > 0 && { query: parts.length === 1 ? parts[0] : { and: parts } }),
    ...(postFilter && { postFilter }),
    sort: buildSort(sort, locale),
    limit,
    offset,
    markMatchingVariants: true,
    ...(withFacets && { facets: expressions }),
    productProjectionParameters: { priceCurrency: currency, priceCountry: country },
  };

  const { body } = await apiRoot.products().search().post({ body: request }).execute();
  const products: Product[] = body.results
    .map((r) => r.productProjection)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => mapProduct(p, locale));

  return { products, total: body.total, offset: body.offset, limit: body.limit, facets: withFacets ? mapFacets(body.facets, meta, locale) : [] };
}

export async function getProductBySku(sku: string, locale: string, currency: string, country: string): Promise<Product | null> {
  const { body } = await apiRoot.products().search().post({
    body: {
      query: { exact: { field: 'variants.sku', value: sku } },
      limit: 1,
      productProjectionParameters: { priceCurrency: currency, priceCountry: country },
    },
  }).execute();
  const p = body.results[0]?.productProjection;
  return p ? mapProduct(p, locale) : null;
}
