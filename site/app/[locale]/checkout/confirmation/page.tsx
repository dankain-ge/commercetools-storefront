import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getOrderById } from '@/lib/ct/orders';
import { formatMoney } from '@/lib/utils';
import Button from '@/components/ui/Button';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checkout');
  return { title: t('confirmationTitle') };
}

export default async function ConfirmationPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ orderId?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { orderId } = await searchParams;
  const t = await getTranslations('checkout');
  const order = orderId ? await getOrderById(orderId, locale).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-5xl">✓</p>
      <h1 className="mt-4 text-3xl font-semibold">{t('thankYou')}</h1>
      <p className="mt-2 text-charcoal-light">{order?.orderNumber ? t('orderNumber', { number: order.orderNumber }) : orderId ? t('orderId', { id: orderId }) : t('orderPlaced')}</p>
      {order && (
        <div className="mt-8 rounded-sm border border-border bg-white p-6 text-left">
          <ul className="divide-y divide-border">
            {order.lineItems.map((li) => (
              <li key={li.id} className="flex items-center gap-4 py-3">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                  {li.image && <Image src={li.image} alt={li.name} fill sizes="48px" className="object-cover" />}
                </div>
                <div className="flex-1 text-sm"><p className="font-medium">{li.name}</p><p className="text-charcoal-light">× {li.quantity}</p></div>
                <span className="text-sm">{formatMoney(li.totalPrice, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold"><span>{t('total')}</span><span>{formatMoney(order.totalPrice, locale)}</span></div>
          {order.customerEmail && <p className="mt-2 text-xs text-charcoal-light">{t('confirmationSent', { email: order.customerEmail })}</p>}
        </div>
      )}
      <Link href="/" className="mt-8 inline-block"><Button variant="outline">{t('continueShopping')}</Button></Link>
    </div>
  );
}
