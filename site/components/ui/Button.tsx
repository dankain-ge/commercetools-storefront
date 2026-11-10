import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-charcoal text-cream hover:bg-charcoal-light disabled:bg-charcoal/40',
  secondary: 'bg-terra text-cream hover:bg-terra-dark disabled:bg-terra/40',
  outline: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream disabled:opacity-40',
  ghost: 'text-charcoal hover:bg-cream-dark disabled:opacity-40',
};
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };

export default function Button({ variant = 'primary', size = 'md', isLoading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-wide uppercase disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
