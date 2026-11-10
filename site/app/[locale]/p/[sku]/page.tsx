import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProductBySku, getAttributeLabels } from '@/lib/ct/search';
import { getCategoryTree, breadcrumbFor } from '@/lib/ct/categories';
import { COUNTRY_CONFIG } from '@/lib/utils';
import Breadcrumb from '@/components/product/Breadcrumb';
import ImageGallery from '@/components/product/ImageGallery';
import PriceDisplay from '@/components/product/PriceDisplay';
import VariantSelector from '@/components/product/VariantSelector';
import ProductInfo from '@/components/product/ProductInfo';
import AddToCartButton from '@/components/product/AddToCartButton';
import Badge from '@/components/ui/Badge';

type Params = Promise<{ locale: string; sku: string }>;

const loadProduct = cache(async (sku: string, locale: string) => {
  const { currency, country } = COUNTRY_CONFIG[locale];
  return getProductBySku(sku, locale, currency, country).catch(() => null);
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, sku } = await params;
  const product = await loadProduct(sku, locale);
  if (!product) return { title: 'Not found' };
  return { title: product.name, description: product.description?.slice(0, 160) };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, sku } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('product');

  const [product, labels, tree] = await Promise.all([loadProduct(sku, locale), getAttributeLabels(locale).catch(() => ({})), getCategoryTree(locale)]);
  if (!product) notFound();

  const variant = product.variants.find((v) => v.sku === sku) ?? product.variants[0];
  const crumbs = product.categoryIds.map((id) => breadcrumbFor(tree, id)).sort((a, b) => b.length - a.length)[0] ?? [];

  return (
    <div>
      <Breadcrumb items={[...crumbs, { name: product.name, href: `/p/${sku}` }]} homeLabel={t('home')} />
      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery images={variant.images.length ? variant.images : product.variants[0].images} alt={product.name} />
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <p className="mt-1 text-xs text-charcoal-light">{t('sku')}: {variant.sku}</p>
          </div>
          <div className="flex items-center gap-3">
            <PriceDisplay price={variant.price} locale={locale} className="text-2xl" />
            <Badge variant={variant.isOnStock ? 'success' : 'error'}>{variant.isOnStock ? t('inStock') : t('outOfStock')}</Badge>
          </div>
          <VariantSelector variants={product.variants} selectedSku={variant.sku} locale={locale} labels={labels} />
          <AddToCartButton sku={variant.sku} disabled={!variant.isOnStock || !variant.price} />
          {product.description && <p className="text-sm leading-relaxed text-charcoal-light">{product.description}</p>}
          <ProductInfo variant={variant} locale={locale} labels={labels} />
        </div>
      </div>
    </div>
  );
}
