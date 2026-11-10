import { Link } from '@/i18n/routing';
import type { BreadcrumbItem } from '@/lib/types';

export default function Breadcrumb({ items, homeLabel }: { items: BreadcrumbItem[]; homeLabel: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-charcoal-light">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href="/" className="hover:underline">{homeLabel}</Link></li>
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1">
            <span aria-hidden>/</span>
            {i === items.length - 1 ? <span className="text-charcoal">{item.name}</span> : <Link href={item.href} className="hover:underline">{item.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
