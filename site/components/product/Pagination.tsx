import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface Props { total: number; offset: number; limit: number; pathname: string; searchParams: Record<string, string> }

export default function Pagination({ total, offset, limit, pathname, searchParams }: Props) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  const current = Math.floor(offset / limit);
  const href = (page: number) => {
    const qs = new URLSearchParams({ ...searchParams, offset: String(page * limit) });
    if (page === 0) qs.delete('offset');
    const s = qs.toString();
    return `${pathname}${s ? `?${s}` : ''}`;
  };
  const window = Array.from({ length: pages }, (_, i) => i).filter((i) => Math.abs(i - current) <= 2 || i === 0 || i === pages - 1);
  return (
    <nav className="mt-10 flex items-center justify-center gap-1 text-sm" aria-label="Pagination">
      {current > 0 && <Link href={href(current - 1)} className="px-3 py-1.5 hover:underline">‹</Link>}
      {window.map((i, idx) => (
        <span key={i} className="flex items-center">
          {idx > 0 && window[idx - 1] !== i - 1 && <span className="px-1 text-charcoal-light">…</span>}
          <Link href={href(i)} className={cn('rounded-sm px-3 py-1.5 hover:bg-cream-dark', i === current && 'bg-charcoal text-cream hover:bg-charcoal')} aria-current={i === current ? 'page' : undefined}>{i + 1}</Link>
        </span>
      ))}
      {current < pages - 1 && <Link href={href(current + 1)} className="px-3 py-1.5 hover:underline">›</Link>}
    </nav>
  );
}
