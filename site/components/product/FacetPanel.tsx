'use client';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Facet } from '@/lib/types';
import { cn } from '@/lib/utils';

const PREFIX = 'f_';

export default function FacetPanel({ facets }: { facets: Facet[] }) {
  const t = useTranslations('product.filters');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selected = (name: string): string[] => (params.get(PREFIX + name) ?? '').split(',').filter(Boolean);

  const navigate = (next: URLSearchParams) => {
    next.delete('offset');
    const s = next.toString();
    router.push(`${pathname}${s ? `?${s}` : ''}`);
  };

  const toggleDistinct = (name: string, key: string) => {
    const next = new URLSearchParams(params.toString());
    const values = selected(name);
    const updated = values.includes(key) ? values.filter((v) => v !== key) : [...values, key];
    if (updated.length) next.set(PREFIX + name, updated.join(',')); else next.delete(PREFIX + name);
    navigate(next);
  };

  const setRange = (name: string, key: string) => {
    const next = new URLSearchParams(params.toString());
    if (params.get(PREFIX + name) === key) next.delete(PREFIX + name); else next.set(PREFIX + name, key);
    navigate(next);
  };

  const clearAll = () => {
    const next = new URLSearchParams(params.toString());
    [...next.keys()].filter((k) => k.startsWith(PREFIX)).forEach((k) => next.delete(k));
    navigate(next);
  };

  const active = facets.flatMap((f) => selected(f.name).map((key) => ({ facet: f, key, label: f.buckets.find((b) => b.key === key)?.label ?? key })));

  return (
    <div className="space-y-6 text-sm">
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {active.map(({ facet, key, label }) => (
            <button key={`${facet.name}-${key}`} onClick={() => (facet.kind === 'ranges' ? setRange(facet.name, key) : toggleDistinct(facet.name, key))} className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs hover:border-charcoal">
              {facet.label}: {label} <span aria-hidden>✕</span>
            </button>
          ))}
          {active.length > 1 && <button onClick={clearAll} className="text-xs underline">{t('clearAll')}</button>}
        </div>
      )}
      {facets.map((f) => {
        const current = selected(f.name);
        return (
          <fieldset key={f.name}>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-light">{f.name === 'isOnStock' ? t('inStock') : f.name === 'price' ? t('price') : f.label}</legend>
            <ul className="space-y-1">
              {f.buckets.map((b) => {
                const checked = current.includes(b.key);
                return (
                  <li key={b.key}>
                    <label className={cn('flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-cream-dark', checked && 'font-medium')}>
                      <span className="flex items-center gap-2">
                        <input type={f.kind === 'ranges' ? 'radio' : 'checkbox'} checked={checked} onChange={() => (f.kind === 'ranges' ? setRange(f.name, b.key) : toggleDistinct(f.name, b.key))} className="accent-charcoal" />
                        {b.label}
                      </span>
                      <span className="text-xs text-charcoal-light">{b.count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );
}
