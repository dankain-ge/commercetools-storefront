'use client';
import { useEffect, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function MegaMenu({ categoryTree }: { categoryTree: Category[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      {categoryTree.map((root) => {
        const active = pathname.startsWith(`/category/${root.slug}`);
        const hasChildren = root.children.length > 0;
        return (
          <div key={root.id} className="relative" onMouseEnter={() => hasChildren && setOpen(root.id)} onMouseLeave={() => setOpen(null)}>
            <Link
              href={`/category/${root.slug}`}
              className={cn('rounded px-3 py-2 text-sm font-medium hover:bg-cream-dark', active && 'text-terra')}
              onClick={() => setOpen(null)}
            >
              {root.name}
            </Link>
            {hasChildren && open === root.id && (
              <div className="absolute left-0 top-full z-50 min-w-[16rem] rounded-sm border border-border bg-cream p-4 shadow-lg">
                <ul className="grid gap-1">
                  {root.children.map((child) => (
                    <li key={child.id}>
                      <Link href={`/category/${child.slug}`} className="block rounded px-2 py-1.5 text-sm hover:bg-cream-dark" onClick={() => setOpen(null)}>
                        {child.name}
                      </Link>
                      {child.children.length > 0 && (
                        <ul className="ml-3 mt-1 grid gap-0.5 border-l border-border pl-3">
                          {child.children.map((g) => (
                            <li key={g.id}>
                              <Link href={`/category/${g.slug}`} className="block rounded px-2 py-1 text-xs text-charcoal-light hover:bg-cream-dark" onClick={() => setOpen(null)}>
                                {g.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
