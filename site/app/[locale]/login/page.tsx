import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import LoginForm from '@/components/account/LoginForm';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <div className="py-10"><Suspense><LoginForm /></Suspense></div>;
}
