import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('common');
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="mt-2 text-charcoal-light">{t('notFound')}</p>
      <Link href="/" className="mt-6 inline-block underline">{t('backHome')}</Link>
    </div>
  );
}
