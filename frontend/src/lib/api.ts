import type {
  Conversation,
  InferenceLog,
  MetricsSummary,
  Provider,
  TokenUsage,
} from '@/types';

/** Same-origin /api on Vercel; separate backend when NEXT_PUBLIC_API_URL is set (local dev). */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  conversations: {
    list: (params?: { search?: string; status?: string; provider?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.status) q.set('status', params.status);
      if (params?.provider) q.set('provider', params.provider);
      const qs = q.toString();
      return request<{ conversations: Conversation[]; total: number }>(
        `/api/conversations${qs ? `?${qs}` : ''}`
      );
    },
    get: (id: string) => request<Conversation>(`/api/conversations/${id}`),
    cancel: (id: string) =>
      request<Conversation>(`/api/conversations/${id}/cancel`, { method: 'POST' }),
    delete: (id: string) =>
      request<void>(`/api/conversations/${id}`, { method: 'DELETE' }),
  },

  logs: {
    list: (params?: { conversationId?: string; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.conversationId) q.set('conversationId', params.conversationId);
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString();
      return request<{ logs: InferenceLog[]; total: number }>(
        `/api/logs${qs ? `?${qs}` : ''}`
      );
    },
  },

  metrics: () => request<MetricsSummary>('/api/metrics'),

  config: () =>
    request<{
      mockLlmForced: boolean;
      defaultProvider: string;
      providers: Record<
        string,
        { hasApiKey: boolean; mode: 'live' | 'mock'; hint: string }
      >;
      hint: string;
    }>('/api/config'),

  chat: {
    cancel: (conversationId: string) =>
      request<{ cancelled: boolean }>('/api/chat/cancel', {
        method: 'POST',
        body: JSON.stringify({ conversationId }),
      }),

    stream: async function* (
      body: {
        messages: { role: string; content: string }[];
        provider: Provider;
        model?: string;
        conversationId?: string;
        sessionId?: string;
      },
      signal?: AbortSignal
    ): AsyncGenerator<
      | { type: 'conversationId'; conversationId: string }
      | { type: 'token'; token: string }
      | { type: 'done'; usage: TokenUsage; messageId?: string }
      | { type: 'error'; error: string }
      | { type: 'cancelled' }
    > {
      const res = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('Stream request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.conversationId) {
              yield { type: 'conversationId', conversationId: data.conversationId };
            } else if (data.token) {
              yield { type: 'token', token: data.token };
            } else if (data.done) {
              yield { type: 'done', usage: data.usage, messageId: data.messageId };
            } else if (data.error) {
              yield { type: 'error', error: data.error };
            } else if (data.cancelled) {
              yield { type: 'cancelled' };
            }
          } catch {
            /* skip malformed */
          }
        }
      }
    },
  },
};
