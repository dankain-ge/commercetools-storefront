import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getCategoryTree } from '@/lib/ct/categories';
import { searchProducts } from '@/lib/ct/search';
import { COUNTRY_CONFIG } from '@/lib/utils';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { currency, country } = COUNTRY_CONFIG[locale];
  const t = await getTranslations('home');

  const tree = await getCategoryTree(locale);
  // Look up by key, not slug: slugs are localized (de-DE is "ganz-neu"), keys are stable.
  const newArrivals = tree.find((c) => c.key === 'new-arrivals') ?? null;
  const featured = newArrivals
    ? await searchProducts({ categoryId: newArrivals.id, locale, currency, country, limit: 8, withFacets: false }).catch(() => null)
    : null;
  const heroImage = featured?.products[0]?.variants[0]?.images[0];
  const roots = tree.filter((c) => c.slug !== newArrivals?.slug);

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 rounded-sm bg-cream-dark p-8 md:grid-cols-2 md:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terra">{t('eyebrow')}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">{t('headline')}</h1>
          <p className="mt-4 max-w-md text-charcoal-light">{t('subline')}</p>
          <div className="mt-8 flex gap-3">
            {newArrivals && <Link href={`/category/${newArrivals.slug}`}><Button size="lg">{t('shopNew')}</Button></Link>}
            {roots[0] && <Link href={`/category/${roots[0].slug}`}><Button size="lg" variant="outline">{roots[0].name}</Button></Link>}
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-white">
          {heroImage && <Image src={heroImage} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-cover" />}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">{t('shopByRoom')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {roots.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="group rounded-sm border border-border bg-white p-6 transition hover:border-charcoal">
              <h3 className="text-lg font-medium group-hover:underline">{c.name}</h3>
              <p className="mt-1 text-sm text-charcoal-light">{c.children.map((ch) => ch.name).slice(0, 4).join(' · ')}</p>
            </Link>
          ))}
        </div>
      </section>

      {featured && featured.products.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">{newArrivals?.name}</h2>
            {newArrivals && <Link href={`/category/${newArrivals.slug}`} className="text-sm underline">{t('viewAll')}</Link>}
          </div>
          <ProductGrid products={featured.products} locale={locale} />
        </section>
      )}
    </div>
  );
}
