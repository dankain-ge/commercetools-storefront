'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { COUNTRY_CONFIG } from '@/lib/utils';
import Select from '@/components/ui/Select';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const change = (next: string) => {
    const qs = searchParams.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { locale: next });
    router.refresh(); // server-rendered tree re-renders with the new locale cookie
  };
  return (
    <Select aria-label="Country" value={locale} onChange={(e) => change(e.target.value)} className="py-1.5 text-xs">
      {Object.values(COUNTRY_CONFIG).map((c) => (
        <option key={c.locale} value={c.locale}>{c.label} · {c.currency}</option>
      ))}
    </Select>
  );
}
