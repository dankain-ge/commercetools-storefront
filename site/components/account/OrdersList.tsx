'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useOrders } from '@/hooks/useAccount';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatMoney } from '@/lib/utils';

export default function OrdersList() {
  const { data: orders, isLoading } = useOrders(true);
  const locale = useLocale();
  const t = useTranslations('account');
  if (isLoading || !orders) return <div className="flex justify-center py-10"><Spinner /></div>;
  if (orders.length === 0) return <p className="text-sm text-charcoal-light">{t('noOrders')}</p>;
  return (
    <ul className="divide-y divide-border">
      {orders.map((o) => (
        <li key={o.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{o.orderNumber ? `#${o.orderNumber}` : o.id.slice(0, 8)}</p>
            <p className="text-xs text-charcoal-light">{new Date(o.createdAt).toLocaleDateString(locale)} · {o.lineItems.length} {t('items')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="neutral">{o.orderState}</Badge>
            {o.paymentState && <Badge variant={o.paymentState === 'Paid' ? 'success' : 'warning'}>{o.paymentState}</Badge>}
            <strong>{formatMoney(o.totalPrice, locale)}</strong>
          </div>
        </li>
      ))}
    </ul>
  );
}
