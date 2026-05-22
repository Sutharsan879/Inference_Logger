'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Navbar } from '@/components/layout/Navbar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChat } from '@/hooks/useChat';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { ChatMessage, Provider } from '@/types';

const DEFAULT_MODELS: Record<Provider, string> = {
  groq: 'llama-3.3-70b-versatile',
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.5-flash',
};

interface ChatPageClientProps {
  conversationId?: string;
  initialMessages?: ChatMessage[];
}

export function ChatPageClient({ conversationId, initialMessages }: ChatPageClientProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider>('anthropic');
  const [model, setModel] = useState(DEFAULT_MODELS.anthropic);

  useEffect(() => {
    if (conversationId) return;
    api.config().then((c) => {
      const live = c.defaultProvider as Provider;
      if (live && c.providers[live]?.mode === 'live') {
        setProvider(live);
        setModel(DEFAULT_MODELS[live]);
      }
    });
  }, [conversationId]);

  const { messages, isStreaming, error, lastUsage, sendMessage, cancel, conversationId: convId } =
    useChat({
      conversationId,
      provider,
      model,
      initialMessages,
    });

  const handleSend = async (content: string) => {
    await sendMessage(content);
    if (!conversationId && convId) {
      router.push(`/chat/${convId}`);
    }
  };

  const handleCancelConversation = async () => {
    const id = convId ?? conversationId;
    if (!id) return;
    if (isStreaming) await cancel();
    await api.conversations.cancel(id);
    router.push('/conversations');
  };

  const activeConvId = convId ?? conversationId;

  return (
    <PageLayout
      activeConversationId={activeConvId}
      mobileTitle="Chat"
      header={
        <div className="flex shrink-0 flex-col border-b border-surface-border sm:flex-row sm:items-stretch">
          <div className="min-w-0 flex-1">
            <Navbar
              provider={provider}
              model={model}
              onProviderChange={(p) => {
                setProvider(p);
                setModel(DEFAULT_MODELS[p]);
              }}
              onModelChange={setModel}
            />
          </div>
          {activeConvId && (
            <div className="flex items-center border-t border-surface-border px-3 py-2 sm:border-l sm:border-t-0 sm:px-4">
              <Button
                variant="danger"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleCancelConversation}
              >
                <span className="sm:hidden">Cancel</span>
                <span className="hidden sm:inline">Cancel conversation</span>
              </Button>
            </div>
          )}
        </div>
      }
    >
      <ChatWindow
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        lastUsage={lastUsage}
        onSend={handleSend}
        onCancel={cancel}
      />
    </PageLayout>
  );
}
