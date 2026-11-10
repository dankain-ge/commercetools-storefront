'use client';
import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAccount';

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try { await register(form); router.push('/account'); }
    catch (err) { setError(err instanceof Error ? err.message : t('registerFailed')); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('register')}</h1>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t('firstName')} autoComplete="given-name" value={form.firstName} onChange={set('firstName')} />
        <Input label={t('lastName')} autoComplete="family-name" value={form.lastName} onChange={set('lastName')} />
      </div>
      <Input label={t('email')} type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
      <Input label={t('password')} type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set('password')} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={busy}>{t('createAccount')}</Button>
      <p className="text-sm text-charcoal-light">{t('haveAccount')} <Link href="/login" className="underline">{t('signIn')}</Link></p>
    </form>
  );
}
