'use client';

import { useCallback, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { ChatMessage, Provider, TokenUsage } from '@/types';

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
};

interface UseChatOptions {
  conversationId?: string;
  provider: Provider;
  model?: string;
  initialMessages?: ChatMessage[];
}

export function useChat({
  conversationId: initialConversationId,
  provider,
  model,
  initialMessages = [],
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsage, setLastUsage] = useState<TokenUsage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: ChatMessage = { role: 'user', content: content.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setError(null);
      setIsStreaming(true);

      const assistantPlaceholder: ChatMessage = { role: 'assistant', content: '' };
      setMessages([...nextMessages, assistantPlaceholder]);

      abortRef.current = new AbortController();

      try {
        const stream = api.chat.stream(
          {
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            provider,
            model: model ?? DEFAULT_MODELS[provider],
            conversationId,
          },
          abortRef.current.signal
        );

        let accumulated = '';
        let resolvedConvId = conversationId;

        for await (const event of stream) {
          if (event.type === 'conversationId') {
            resolvedConvId = event.conversationId;
            setConversationId(event.conversationId);
          } else if (event.type === 'token') {
            accumulated += event.token;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: 'assistant', content: accumulated };
              return copy;
            });
          } else if (event.type === 'done') {
            setLastUsage(event.usage);
          } else if (event.type === 'error') {
            setError(event.error);
          } else if (event.type === 'cancelled') {
            setError('Generation cancelled');
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to send message');
        }
        setMessages((prev) => prev.filter((m) => m.content.length > 0 || m.role === 'user'));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, provider, model, conversationId]
  );

  const cancel = useCallback(async () => {
    abortRef.current?.abort();
    if (conversationId) {
      try {
        await api.chat.cancel(conversationId);
      } catch {
        /* ignore */
      }
    }
    setIsStreaming(false);
  }, [conversationId]);

  const setInitial = useCallback((msgs: ChatMessage[], convId?: string) => {
    setMessages(msgs);
    if (convId) setConversationId(convId);
  }, []);

  return {
    messages,
    conversationId,
    isStreaming,
    error,
    lastUsage,
    sendMessage,
    cancel,
    setInitial,
  };
}
