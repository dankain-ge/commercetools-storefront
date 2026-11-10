'use client';
import { useTranslations } from 'next-intl';
import { useAccount } from '@/hooks/useAccount';

export default function AccountPage() {
  const { user } = useAccount();
  const t = useTranslations('account');
  if (!user) return null;
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{t('welcome', { name: user.firstName || user.email })}</h1>
      <dl className="grid max-w-md gap-3 text-sm">
        <div><dt className="text-xs uppercase tracking-wide text-charcoal-light">{t('name')}</dt><dd>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</dd></div>
        <div><dt className="text-xs uppercase tracking-wide text-charcoal-light">{t('email')}</dt><dd>{user.email}</dd></div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-charcoal-light">{t('addresses')}</dt>
          <dd>{user.addresses.length === 0 ? t('noAddresses') : (
            <ul className="mt-1 space-y-2">
              {user.addresses.map((a, i) => (
                <li key={a.id ?? i} className="rounded-sm border border-border bg-white p-3">
                  {[a.firstName, a.lastName].filter(Boolean).join(' ')}<br />{[a.streetName, a.streetNumber].filter(Boolean).join(' ')}<br />{[a.postalCode, a.city].filter(Boolean).join(' ')}, {a.country}
                </li>
              ))}
            </ul>
          )}</dd>
        </div>
      </dl>
    </div>
  );
}
