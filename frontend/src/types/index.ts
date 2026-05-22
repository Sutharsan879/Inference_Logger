export type Provider = 'anthropic' | 'openai' | 'gemini';
export type ConversationStatus = 'active' | 'cancelled' | 'completed';
export type MessageRole = 'user' | 'assistant' | 'system';
export type LogStatus = 'success' | 'error' | 'cancelled';

export interface ChatMessage {
  id?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  title: string;
  provider: Provider;
  model: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  _count?: { messages: number; logs: number };
}

export interface InferenceLog {
  id: string;
  conversationId: string;
  sessionId?: string;
  provider: Provider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  timeToFirstTokenMs?: number;
  status: LogStatus;
  errorMessage?: string;
  inputPreview?: string;
  outputPreview?: string;
  createdAt: string;
  conversation?: { id: string; title: string; sessionId: string };
}

export interface MetricsSummary {
  totalRequests: number;
  errorRate: number;
  avgLatencyMs: number;
  totalTokens: number;
  requestsPerMinute: { timestamp: string; count: number }[];
  latencyOverTime: { timestamp: string; latencyMs: number }[];
  tokensPerConversation: { conversationId: string; title: string; tokens: number }[];
  providerBreakdown: { provider: string; count: number }[];
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
