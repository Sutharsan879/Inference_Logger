'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ChatPageClient } from '../ChatPageClient';
import { Spinner } from '@/components/ui/Spinner';
import type { ChatMessage } from '@/types';

export default function ConversationChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.conversations
      .get(id)
      .then((conv) => {
        setMessages(
          (conv.messages ?? []).map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          }))
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center p-4">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[100dvh] items-center justify-center p-4 text-center text-sm text-red-400 sm:text-base">
        {error}
      </div>
    );
  }

  return (
    <ChatPageClient key={id} conversationId={id} initialMessages={messages} />
  );
}
