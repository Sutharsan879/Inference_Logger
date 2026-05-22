import type { ReactNode } from 'react';

export function ChartContainer({ children }: { children: ReactNode }) {
  return <div className="h-[200px] w-full min-w-0 sm:h-[240px]">{children}</div>;
}
