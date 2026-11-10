import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CartView from '@/components/cart/CartView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cart');
  return { title: t('title') };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cart');
  return (
    <div>
      <h1 className="mb-8 text-3xl font-semibold">{t('title')}</h1>
      <CartView />
    </div>
  );
}
