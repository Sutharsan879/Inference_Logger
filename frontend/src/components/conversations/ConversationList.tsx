'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ConversationCard } from './ConversationCard';
import { useConversations } from '@/hooks/useConversations';
import type { Provider } from '@/types';

const selectClass =
  'w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-gray-200 sm:w-auto';

export function ConversationList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');

  const { conversations, total, loading, error, refresh } = useConversations({
    search: search || undefined,
    status: status || undefined,
    provider: (provider as Provider) || undefined,
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Conversations</h2>
        <p className="text-sm text-gray-500">{total} total</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:mb-6 sm:flex sm:flex-wrap sm:gap-3">
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className={selectClass}>
          <option value="">All providers</option>
          <option value="groq">Groq</option>
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : conversations.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">No conversations found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {conversations.map((c) => (
            <ConversationCard key={c.id} conversation={c} onCancel={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
