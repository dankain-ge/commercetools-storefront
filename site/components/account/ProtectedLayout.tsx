'use client';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';
import Spinner from '@/components/ui/Spinner';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [user, router, pathname]);

  if (user === undefined || user === null) return <div className="flex justify-center py-20"><Spinner /></div>;
  return <>{children}</>;
}
