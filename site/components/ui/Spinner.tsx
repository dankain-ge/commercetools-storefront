import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function Spinner({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      {...props}
    />
  );
}
