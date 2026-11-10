import { setRequestLocale } from 'next-intl/server';
import RegisterForm from '@/components/account/RegisterForm';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <div className="py-10"><RegisterForm /></div>;
}
