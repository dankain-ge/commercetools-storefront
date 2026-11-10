import { useTranslations } from 'next-intl';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, locale }: { products: Product[]; locale: string }) {
  const t = useTranslations('product');
  if (products.length === 0) return <p className="py-16 text-center text-charcoal-light">{t('noResults')}</p>;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => <ProductCard key={p.id} product={p} locale={locale} priority={i < 4} />)}
    </div>
  );
}
