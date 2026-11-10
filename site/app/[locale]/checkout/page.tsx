import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import HostedCheckout from '@/components/checkout/HostedCheckout';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checkout');
  return { title: t('title') };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('checkout');
  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold">{t('title')}</h1>
      <HostedCheckout />
    </div>
  );
}
