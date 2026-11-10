import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCategoryBySlug, getCategoryTree, breadcrumbFor } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import { COUNTRY_CONFIG } from '@/lib/utils';
import type { SortOption } from '@/lib/types';
import { Link } from '@/i18n/routing';
import Breadcrumb from '@/components/product/Breadcrumb';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/product/Pagination';
import SortSelect from '@/components/product/SortSelect';
import FacetPanel from '@/components/product/FacetPanel';

type Params = Promise<{ locale: string; slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;
const PAGE_SIZE = 24;

function flatten(sp: Record<string, string | string[] | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : Array.isArray(v) && v[0] ? [[k, v[0]]] : [])));
}
function facetFilters(sp: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(sp).filter(([k]) => k.startsWith('f_')).map(([k, v]) => [k.slice(2), v]));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug, locale).catch(() => null);
  return category ? { title: category.name } : {};
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sp = flatten(await searchParams);
  const { currency, country } = COUNTRY_CONFIG[locale];
  const t = await getTranslations('product');

  const [category, tree] = await Promise.all([getCategoryBySlug(slug, locale), getCategoryTree(locale)]);
  if (!category) notFound();

  const offset = Math.max(0, parseInt(sp.offset ?? '0', 10) || 0);
  const result = await searchProducts({
    categoryId: category.id, locale, currency, country, limit: PAGE_SIZE, offset,
    sort: (sp.sort as SortOption | undefined) ?? 'relevance', filters: facetFilters(sp),
  });
  const crumbs = breadcrumbFor(tree, category.id);
  const subcategories = crumbs.length ? (tree.flatMap(function walk(c): typeof tree { return [c, ...c.children.flatMap(walk)]; }).find((c) => c.id === category.id)?.children ?? []) : [];

  return (
    <div>
      <Breadcrumb items={crumbs} homeLabel={t('home')} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{category.name}</h1>
          <p className="mt-1 text-sm text-charcoal-light">{t('resultCount', { count: result.total })}</p>
          {subcategories.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {subcategories.map((c) => (
                <li key={c.id}><Link href={`/category/${c.slug}`} className="rounded-full border border-border px-3 py-1 text-xs hover:border-charcoal">{c.name}</Link></li>
              ))}
            </ul>
          )}
        </div>
        <SortSelect />
      </div>
      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <aside><FacetPanel facets={result.facets} /></aside>
        <div>
          <ProductGrid products={result.products} locale={locale} />
          <Pagination total={result.total} offset={result.offset} limit={result.limit} pathname={`/category/${slug}`} searchParams={Object.fromEntries(Object.entries(sp).filter(([k]) => k !== 'offset'))} />
        </div>
      </div>
    </div>
  );
}
