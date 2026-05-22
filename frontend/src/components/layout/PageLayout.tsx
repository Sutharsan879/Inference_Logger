'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { useConversations } from '@/hooks/useConversations';
import { useIsLgUp } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  activeConversationId?: string;
  header?: React.ReactNode;
  mobileTitle?: string;
  scrollable?: boolean;
}

export function PageLayout({
  children,
  activeConversationId,
  header,
  mobileTitle,
  scrollable = false,
}: PageLayoutProps) {
  const pathname = usePathname();
  const isLg = useIsLgUp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { conversations, loading } = useConversations();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLg) setSidebarOpen(false);
  }, [isLg]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && !isLg ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, isLg]);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {sidebarOpen && !isLg && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        conversations={conversations}
        loading={loading}
        activeId={activeConversationId}
        open={sidebarOpen || isLg}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader onMenuOpen={() => setSidebarOpen(true)} title={mobileTitle} />
        {header}
        <main
          className={cn(
            'min-h-0 flex-1',
            scrollable ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
