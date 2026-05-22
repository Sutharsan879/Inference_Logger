export type Provider = 'anthropic' | 'openai' | 'gemini';
export type ConversationStatus = 'active' | 'cancelled' | 'completed';
export type MessageRole = 'user' | 'assistant' | 'system';
export type LogStatus = 'success' | 'error' | 'cancelled';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LogIngestPayload {
  conversationId: string;
  sessionId?: string;
  messageId?: string;
  provider: Provider;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  timeToFirstTokenMs?: number;
  status: LogStatus;
  errorMessage?: string;
  requestTimestamp: Date;
  responseTimestamp: Date;
  inputPreview?: string;
  outputPreview?: string;
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
