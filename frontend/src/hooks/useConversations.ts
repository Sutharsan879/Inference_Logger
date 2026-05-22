'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Conversation } from '@/types';

interface Filters {
  search?: string;
  status?: string;
  provider?: string;
}

export function useConversations(filters: Filters = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.conversations.list(filters);
      setConversations(data.conversations);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, filters.provider]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const cancelConversation = async (id: string) => {
    await api.conversations.cancel(id);
    await fetchConversations();
  };

  const removeConversation = async (id: string) => {
    await api.conversations.delete(id);
    await fetchConversations();
  };

  return {
    conversations,
    total,
    loading,
    error,
    refresh: fetchConversations,
    cancelConversation,
    removeConversation,
  };
}
