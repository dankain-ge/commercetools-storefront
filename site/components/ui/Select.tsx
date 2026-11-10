'use client';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('rounded-sm border border-border bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-charcoal', className)} {...props}>
      {children}
    </select>
  );
}
