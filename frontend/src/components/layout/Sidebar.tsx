'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LayoutDashboard, List, X } from 'lucide-react';
import { cn, formatDate, truncate } from '@/lib/utils';
import type { Conversation } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

interface SidebarProps {
  conversations: Conversation[];
  loading?: boolean;
  activeId?: string;
  open?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  conversations,
  loading,
  activeId,
  open = true,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  const nav = [
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/conversations', label: 'Conversations', icon: List },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[min(18rem,85vw)] flex-col border-r border-surface-border bg-surface-elevated transition-transform duration-200 ease-out',
        'lg:static lg:z-auto lg:max-w-none lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
      aria-hidden={!open ? true : undefined}
    >
      <div className="flex items-start justify-between border-b border-surface-border p-4">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-white sm:text-lg">LLM Inference Logger</h1>
          <p className="text-xs text-gray-500">LLM observability</p>
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-border hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex gap-1 p-2 sm:gap-1.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-2 text-[10px] font-medium transition-colors sm:flex-row sm:gap-1.5 sm:px-2 sm:text-xs',
              pathname.startsWith(href)
                ? 'bg-accent/20 text-accent-hover'
                : 'text-gray-400 hover:bg-surface-border hover:text-gray-200'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recent</span>
        <Link href="/chat" onClick={onNavigate} className="text-xs text-accent hover:underline">
          + New
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 text-center text-xs text-gray-500">No conversations yet</p>
        ) : (
          conversations.slice(0, 20).map((conv) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              onClick={onNavigate}
              className={cn(
                'mb-1 block rounded-lg px-3 py-2 transition-colors',
                activeId === conv.id || pathname === `/chat/${conv.id}`
                  ? 'bg-accent/15 text-white'
                  : 'text-gray-400 hover:bg-surface-border hover:text-gray-200'
              )}
            >
              <p className="text-sm font-medium">{truncate(conv.title, 28)}</p>
              <p className="truncate text-xs text-gray-500">
                {conv.provider} · {formatDate(conv.updatedAt)}
              </p>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
