'use client';
import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-charcoal-light">{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={cn('rounded-sm border bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-charcoal', error ? 'border-red-500' : 'border-border', className)}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Input;
