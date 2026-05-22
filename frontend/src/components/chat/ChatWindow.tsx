'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { StreamingIndicator } from './StreamingIndicator';
import type { ChatMessage, TokenUsage } from '@/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  lastUsage: TokenUsage | null;
  onSend: (message: string) => void;
  onCancel: () => void;
}

export function ChatWindow({
  messages,
  isStreaming,
  error,
  lastUsage,
  onSend,
  onCancel,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-3 sm:space-y-6 sm:p-4 md:p-6">
        {messages.length === 0 && (
          <div className="flex min-h-[12rem] items-center justify-center px-4 text-center text-sm text-gray-500 sm:min-h-0 sm:h-full sm:text-base">
            <p>Start a conversation — inference logs are captured automatically.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isStreaming && <StreamingIndicator />}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-3 mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 sm:mx-4 sm:px-4">
          {error}
        </div>
      )}

      {lastUsage && !isStreaming && (
        <div className="mx-3 mb-2 break-words text-xs text-gray-500 sm:mx-4">
          Tokens: {lastUsage.prompt_tokens} prompt + {lastUsage.completion_tokens} completion ={' '}
          {lastUsage.total_tokens} total
        </div>
      )}

      <ChatInput onSend={onSend} onCancel={onCancel} isStreaming={isStreaming} />
    </div>
  );
}
