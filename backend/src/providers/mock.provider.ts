import type { ChatMessage } from '../types';
import type { LLMProvider, LLMResponse } from './base.provider';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function buildResponse(messages: ChatMessage[], streamed = false): LLMResponse {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const promptText = messages.map((m) => m.content).join('\n');
  const promptTokens = estimateTokens(promptText);
  const reply = streamed
    ? `I understand you said: "${lastUser?.content ?? 'hello'}". This is a mock streaming response for local development.`
    : `[Mock] Response to: "${lastUser?.content ?? 'hello'}". Configure ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY for real LLM calls.`;
  const completionTokens = estimateTokens(reply);
  return {
    content: reply,
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
    model: 'mock-model',
  };
}

export class MockProvider implements LLMProvider {
  async complete(messages: ChatMessage[], _model?: string): Promise<LLMResponse> {
    await delay(400);
    return buildResponse(messages);
  }

  async stream(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    _model?: string
  ): Promise<LLMResponse> {
    const result = buildResponse(messages, true);
    const words = result.content.split(' ');
    for (const word of words) {
      await delay(40);
      onToken(word + ' ');
    }
    return result;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
