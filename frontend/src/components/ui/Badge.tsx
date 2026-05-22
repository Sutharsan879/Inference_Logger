import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-surface-elevated text-gray-300',
        variant === 'success' && 'bg-emerald-500/20 text-emerald-400',
        variant === 'warning' && 'bg-amber-500/20 text-amber-400',
        variant === 'error' && 'bg-red-500/20 text-red-400',
        variant === 'info' && 'bg-indigo-500/20 text-indigo-300',
        className
      )}
    >
      {children}
    </span>
  );
}
