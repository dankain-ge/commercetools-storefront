import type { Variant } from '@/lib/types';
import { PDP_INFO_ATTRIBUTES } from '@/lib/ct/variant-config';
import { getLocalizedString } from '@/lib/utils';

export default function ProductInfo({ variant, locale, labels }: { variant: Variant; locale: string; labels: Record<string, string> }) {
  const blocks = PDP_INFO_ATTRIBUTES.map((name) => {
    const raw = variant.attributes[name];
    const text = typeof raw === 'string' ? raw : raw && typeof raw === 'object' ? getLocalizedString(raw as Record<string, string>, locale) : '';
    return text ? { name, text } : null;
  }).filter((b): b is { name: string; text: string } => Boolean(b));
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-4 border-t border-border pt-6">
      {blocks.map((b) => (
        <section key={b.name}>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-charcoal-light">{labels[b.name] ?? b.name}</h3>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-charcoal-light">{b.text}</pre>
        </section>
      ))}
    </div>
  );
}
