import type { ReactNode } from 'react';
import ProtectedLayout from '@/components/account/ProtectedLayout';
import AccountNav from '@/components/account/AccountNav';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout>
      <div className="grid gap-8 md:grid-cols-[12rem_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </ProtectedLayout>
  );
}
