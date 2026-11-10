'use client';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAccount';
import { cn } from '@/lib/utils';

export default function AccountNav() {
  const t = useTranslations('account');
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const items = [{ href: '/account', label: t('profile') }, { href: '/account/orders', label: t('orders') }];
  return (
    <nav className="flex gap-2 border-b border-border text-sm md:flex-col md:border-b-0 md:border-r md:pr-6">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={cn('px-3 py-2 hover:text-terra', pathname === i.href && 'font-semibold text-terra')}>{i.label}</Link>
      ))}
      <button onClick={async () => { await logout(); router.push('/'); }} className="px-3 py-2 text-left text-charcoal-light hover:text-red-600">{t('signOut')}</button>
    </nav>
  );
}
