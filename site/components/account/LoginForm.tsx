'use client';
import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAccount';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try { await login(email, password); router.push(params.get('redirect') || '/account'); }
    catch (err) { setError(err instanceof Error ? err.message : t('loginFailed')); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('signIn')}</h1>
      <Input label={t('email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label={t('password')} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={busy}>{t('signIn')}</Button>
      <p className="text-sm text-charcoal-light">{t('noAccount')} <Link href="/register" className="underline">{t('register')}</Link></p>
    </form>
  );
}
