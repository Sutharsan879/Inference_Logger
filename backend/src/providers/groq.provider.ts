import OpenAI from 'openai';
import { env } from '../config/env';
import type { ChatMessage } from '../types';
import type { LLMProvider, LLMResponse } from './base.provider';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export class GroqProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: GROQ_BASE_URL,
    });
  }

  async complete(messages: ChatMessage[], model = 'llama-3.3-70b-versatile'): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const choice = response.choices[0];
    return {
      content: choice?.message?.content ?? '',
      usage: {
        prompt_tokens: response.usage?.prompt_tokens ?? 0,
        completion_tokens: response.usage?.completion_tokens ?? 0,
        total_tokens: response.usage?.total_tokens ?? 0,
      },
      model: response.model,
    };
  }

  async stream(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    model = 'llama-3.3-70b-versatile'
  ): Promise<LLMResponse> {
    const stream = await this.client.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    });

    let content = '';
    let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    let responseModel = model;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        content += delta;
        onToken(delta);
      }
      if (chunk.usage) {
        usage = {
          prompt_tokens: chunk.usage.prompt_tokens ?? 0,
          completion_tokens: chunk.usage.completion_tokens ?? 0,
          total_tokens: chunk.usage.total_tokens ?? 0,
        };
      }
      if (chunk.model) responseModel = chunk.model;
    }

    if (!usage.total_tokens) {
      usage = {
        prompt_tokens: Math.ceil(messages.map((m) => m.content).join('').length / 4),
        completion_tokens: Math.ceil(content.length / 4),
        total_tokens: 0,
      };
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
    }

    return { content, usage, model: responseModel };
  }
}
