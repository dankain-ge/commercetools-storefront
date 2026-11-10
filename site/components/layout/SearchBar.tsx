'use client';
import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const t = useTranslations('search');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  };
  return (
    <form onSubmit={submit} role="search" className="flex items-center rounded-sm border border-border bg-white">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('placeholder')}
        className="w-full bg-transparent px-3 py-1.5 text-sm outline-none md:w-48 lg:w-64"
      />
      <button type="submit" className="px-3 text-sm text-charcoal-light hover:text-charcoal" aria-label={t('submit')}>⌕</button>
    </form>
  );
}
