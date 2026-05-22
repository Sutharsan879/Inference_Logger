'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuOpen: () => void;
  title?: string;
}

export function MobileHeader({ onMenuOpen, title = 'LLM Inference Logger' }: MobileHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-surface-border bg-surface-elevated px-3 py-2.5 lg:hidden">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-lg p-2 text-gray-300 hover:bg-surface-border hover:text-white"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link href="/chat" className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
        {title}
      </Link>
    </header>
  );
}
