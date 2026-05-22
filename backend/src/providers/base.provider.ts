import type { ChatMessage } from '../types';

export interface LLMResponse {
  content: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  model: string;
}

export interface LLMProvider {
  complete(messages: ChatMessage[], model?: string): Promise<LLMResponse>;
  stream(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    model?: string
  ): Promise<LLMResponse>;
}
