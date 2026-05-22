'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, truncate } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Conversation } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  completed: 'success',
  active: 'info',
  cancelled: 'warning',
};

interface ConversationCardProps {
  conversation: Conversation;
  onCancel?: () => void;
}

export function ConversationCard({ conversation, onCancel }: ConversationCardProps) {
  const router = useRouter();

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await api.conversations.cancel(conversation.id);
    onCancel?.();
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated p-3 transition-colors hover:border-accent/40 sm:p-4">
      <Link href={`/chat/${conversation.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 font-medium text-gray-100">
            {truncate(conversation.title, 60)}
          </h3>
          <Badge variant={statusVariant[conversation.status] ?? 'default'} className="shrink-0">
            {conversation.status}
          </Badge>
        </div>
        <p className="mt-2 truncate text-sm text-gray-500">
          {conversation.provider} / {conversation.model}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>{conversation._count?.messages ?? 0} messages</span>
          <span>{conversation._count?.logs ?? 0} logs</span>
          <span className="w-full sm:w-auto">{formatDate(conversation.updatedAt)}</span>
        </div>
      </Link>
      {conversation.status === 'active' && (
        <div className="mt-3 flex flex-col gap-2 border-t border-surface-border pt-3 sm:flex-row">
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => router.push(`/chat/${conversation.id}`)}
          >
            Resume
          </Button>
          <Button variant="danger" size="sm" className="w-full sm:w-auto" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}
      {conversation.status !== 'active' && (
        <div className="mt-3 border-t border-surface-border pt-3">
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => router.push(`/chat/${conversation.id}`)}
          >
            Resume conversation
          </Button>
        </div>
      )}
    </div>
  );
}
