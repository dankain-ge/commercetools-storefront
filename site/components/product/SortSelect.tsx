'use client';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import Select from '@/components/ui/Select';
import type { SortOption } from '@/lib/types';

const OPTIONS: SortOption[] = ['relevance', 'name-asc', 'name-desc', 'price-asc', 'price-desc'];

export default function SortSelect() {
  const t = useTranslations('product.sort');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get('sort') as SortOption) || 'relevance';
  const change = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === 'relevance') next.delete('sort'); else next.set('sort', value);
    next.delete('offset');
    router.push(`${pathname}?${next.toString()}`);
  };
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-charcoal-light">{t('label')}</span>
      <Select value={current} onChange={(e) => change(e.target.value)}>
        {OPTIONS.map((o) => <option key={o} value={o}>{t(o)}</option>)}
      </Select>
    </label>
  );
}
