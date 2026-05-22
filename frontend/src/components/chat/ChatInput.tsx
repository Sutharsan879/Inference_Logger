'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onCancel, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || disabled || isStreaming) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-surface-border bg-surface-elevated p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={2}
          disabled={disabled}
          className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-surface-border bg-surface px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-500 focus:border-accent focus:outline-none sm:px-4 sm:py-3 sm:text-sm"
        />
        {isStreaming ? (
          <Button variant="danger" onClick={onCancel} className="shrink-0 self-end">
            <Square className="h-4 w-4" />
            <span className="sr-only">Stop</span>
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        )}
      </div>
      <p className="mt-1.5 hidden text-xs text-gray-600 sm:block">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
