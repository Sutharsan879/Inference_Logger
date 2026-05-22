import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import { User, Bot } from 'lucide-react';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2 sm:gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8',
          isUser ? 'bg-accent/30' : 'bg-surface-border'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-accent-hover sm:h-4 sm:w-4" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed sm:max-w-[80%] sm:px-4 sm:py-3 md:max-w-[75%]',
          isUser
            ? 'bg-accent text-white'
            : 'border border-surface-border bg-surface-elevated text-gray-200'
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content || (message.role === 'assistant' ? '…' : '')}
        </p>
      </div>
    </div>
  );
}
