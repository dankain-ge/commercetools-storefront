import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="mt-16 border-t border-border bg-cream-dark/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-xs text-charcoal-light sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Lifestyle&amp;Home · {t('tagline')}</p>
        <p>{t('poweredBy')}</p>
      </div>
    </footer>
  );
}
