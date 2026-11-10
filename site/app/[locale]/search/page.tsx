import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { searchProducts } from '@/lib/ct/search';
import { COUNTRY_CONFIG } from '@/lib/utils';
import type { SortOption } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/product/Pagination';
import SortSelect from '@/components/product/SortSelect';
import FacetPanel from '@/components/product/FacetPanel';

type Params = Promise<{ locale: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;
const PAGE_SIZE = 24;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('search');
  return { title: t('title') };
}

export default async function SearchPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;
  const sp: Record<string, string> = Object.fromEntries(Object.entries(raw).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])));
  const q = (sp.q ?? '').trim();
  const { currency, country } = COUNTRY_CONFIG[locale];
  const t = await getTranslations('search');
  const tp = await getTranslations('product');

  const offset = Math.max(0, parseInt(sp.offset ?? '0', 10) || 0);
  const filters = Object.fromEntries(Object.entries(sp).filter(([k]) => k.startsWith('f_')).map(([k, v]) => [k.slice(2), v]));
  const result = q
    ? await searchProducts({ text: q, locale, currency, country, limit: PAGE_SIZE, offset, sort: (sp.sort as SortOption | undefined) ?? 'relevance', filters })
    : null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{q ? t('resultsFor', { query: q }) : t('title')}</h1>
          {result && <p className="mt-1 text-sm text-charcoal-light">{tp('resultCount', { count: result.total })}</p>}
        </div>
        {result && <SortSelect />}
      </div>
      {!result ? (
        <p className="text-charcoal-light">{t('prompt')}</p>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
          <aside><FacetPanel facets={result.facets} /></aside>
          <div>
            <ProductGrid products={result.products} locale={locale} />
            <Pagination total={result.total} offset={result.offset} limit={result.limit} pathname="/search" searchParams={Object.fromEntries(Object.entries(sp).filter(([k]) => k !== 'offset'))} />
          </div>
        </div>
      )}
    </div>
  );
}
