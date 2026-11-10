import { getTranslations, setRequestLocale } from 'next-intl/server';
import OrdersList from '@/components/account/OrdersList';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('account');
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{t('orders')}</h1>
      <OrdersList />
    </div>
  );
}
