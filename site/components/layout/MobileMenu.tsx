'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Drawer from '@/components/ui/Drawer';
import type { Category } from '@/lib/types';

function Tree({ nodes, depth = 0, onNavigate }: { nodes: Category[]; depth?: number; onNavigate: () => void }) {
  return (
    <ul className={depth ? 'ml-3 border-l border-border pl-3' : ''}>
      {nodes.map((c) => (
        <li key={c.id} className="py-1">
          <Link href={`/category/${c.slug}`} onClick={onNavigate} className={depth ? 'text-sm text-charcoal-light' : 'font-medium'}>{c.name}</Link>
          {c.children.length > 0 && <Tree nodes={c.children} depth={depth + 1} onNavigate={onNavigate} />}
        </li>
      ))}
    </ul>
  );
}

export default function MobileMenu({ categoryTree }: { categoryTree: Category[] }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');
  return (
    <>
      <button className="rounded p-2 hover:bg-cream-dark lg:hidden" aria-label={t('menu')} onClick={() => setOpen(true)}>
        <span className="block h-0.5 w-5 bg-charcoal" /><span className="mt-1 block h-0.5 w-5 bg-charcoal" /><span className="mt-1 block h-0.5 w-5 bg-charcoal" />
      </button>
      <Drawer isOpen={open} onClose={() => setOpen(false)} title={t('menu')} position="left">
        <Tree nodes={categoryTree} onNavigate={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
