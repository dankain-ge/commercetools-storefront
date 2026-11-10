'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export default function AccountMenu() {
  const { user } = useAccount();
  const t = useTranslations('nav');
  return (
    <Link href={user ? '/account' : '/login'} className="rounded px-2 py-1.5 text-sm hover:bg-cream-dark" aria-label={t('account')}>
      {user ? (user.firstName || t('account')) : t('signIn')}
    </Link>
  );
}
