import { Link } from '@/i18n/routing';
import type { Variant } from '@/lib/types';
import { VARIANT_SELECTOR_BLOCKLIST, VARIANT_RENDERER_MAP, VARIANT_COLOR_CODE_ATTR, VARIANT_SORT_ORDER } from '@/lib/ct/variant-config';
import { getLocalizedString, cn } from '@/lib/utils';

function attrText(value: unknown, locale: string): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const v = value as { key?: string; label?: unknown };
    if (v.label !== undefined) return typeof v.label === 'string' ? v.label : getLocalizedString(v.label as Record<string, string>, locale);
    if (v.key) return v.key;
    return getLocalizedString(value as Record<string, string>, locale);
  }
  return '';
}

interface Props { variants: Variant[]; selectedSku: string; locale: string; labels: Record<string, string> }

/** Each attribute whose value differs across variants becomes a selector; clicking changes the `[sku]` URL segment. */
export default function VariantSelector({ variants, selectedSku, locale, labels }: Props) {
  if (variants.length < 2) return null;
  const selected = variants.find((v) => v.sku === selectedSku) ?? variants[0];

  const names = new Set<string>();
  for (const v of variants) for (const n of Object.keys(v.attributes)) if (!VARIANT_SELECTOR_BLOCKLIST.includes(n)) names.add(n);
  const varying = [...names].filter((n) => new Set(variants.map((v) => attrText(v.attributes[n], locale))).size > 1);
  varying.sort((a, b) => {
    const ia = VARIANT_SORT_ORDER.indexOf(a), ib = VARIANT_SORT_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  if (varying.length === 0) return null;

  return (
    <div className="space-y-4">
      {varying.map((name) => {
        const renderer = VARIANT_RENDERER_MAP[name] ?? 'pill';
        const seen = new Map<string, Variant>();
        for (const v of variants) { const key = attrText(v.attributes[name], locale); if (key && !seen.has(key)) seen.set(key, v); }
        const currentValue = attrText(selected.attributes[name], locale);
        return (
          <div key={name}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-light">{labels[name] ?? name}: <span className="font-normal normal-case text-charcoal">{currentValue}</span></p>
            <ul className="flex flex-wrap gap-2">
              {[...seen.entries()].map(([value, variant]) => {
                // prefer a variant that keeps the other selected attributes
                const best = variants.find((v) => attrText(v.attributes[name], locale) === value && varying.every((o) => o === name || attrText(v.attributes[o], locale) === attrText(selected.attributes[o], locale))) ?? variant;
                const isActive = value === currentValue;
                const color = renderer === 'color' ? (best.attributes[VARIANT_COLOR_CODE_ATTR[name]] as string | undefined) : undefined;
                return (
                  <li key={value}>
                    <Link
                      href={`/p/${best.sku}`}
                      title={value}
                      className={cn(
                        'flex items-center justify-center border text-sm transition',
                        renderer === 'color' ? 'h-8 w-8 rounded-full' : 'rounded-sm px-3 py-1.5',
                        isActive ? 'border-charcoal ring-1 ring-charcoal' : 'border-border hover:border-charcoal',
                        !best.isOnStock && 'opacity-40',
                      )}
                      style={color ? { backgroundColor: color } : undefined}
                    >
                      {renderer === 'color' ? <span className="sr-only">{value}</span> : value}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
