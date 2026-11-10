import { formatMoney } from '@/lib/utils';
import type { Price } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function PriceDisplay({ price, locale, className }: { price?: Price; locale: string; className?: string }) {
  if (!price) return <span className={cn('text-sm text-charcoal-light', className)}>—</span>;
  if (price.discounted) {
    return (
      <span className={cn('flex items-baseline gap-2', className)}>
        <span className="font-semibold text-terra">{formatMoney(price.discounted, locale)}</span>
        <s className="text-sm text-charcoal-light">{formatMoney(price.value, locale)}</s>
      </span>
    );
  }
  return <span className={cn('font-semibold', className)}>{formatMoney(price.value, locale)}</span>;
}
