import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
        className
      )}
      {...props}
    />
  );
}
