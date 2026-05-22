import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className, title }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-border bg-surface-elevated p-4 shadow-sm sm:p-5',
        className
      )}
    >
      {title && <h3 className="mb-4 text-sm font-semibold text-gray-300">{title}</h3>}
      {children}
    </div>
  );
}
