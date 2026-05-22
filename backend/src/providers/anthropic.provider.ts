import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import type { ChatMessage } from '../types';
import type { LLMProvider, LLMResponse } from './base.provider';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async complete(messages: ChatMessage[], model = 'claude-sonnet-4-20250514'): Promise<LLMResponse> {
    const { system, chatMessages } = splitSystem(messages);
    const response = await this.client.messages.create({
      model,
      max_tokens: 4096,
      system,
      messages: chatMessages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    return {
      content: text,
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
    };
  }

  async stream(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    model = 'claude-sonnet-4-20250514'
  ): Promise<LLMResponse> {
    const { system, chatMessages } = splitSystem(messages);
    const stream = await this.client.messages.stream({
      model,
      max_tokens: 4096,
      system,
      messages: chatMessages,
    });

    let content = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const token = event.delta.text;
        content += token;
        onToken(token);
      }
    }

    const final = await stream.finalMessage();
    return {
      content,
      usage: {
        prompt_tokens: final.usage.input_tokens,
        completion_tokens: final.usage.output_tokens,
        total_tokens: final.usage.input_tokens + final.usage.output_tokens,
      },
      model: final.model,
    };
  }
}

function splitSystem(messages: ChatMessage[]): {
  system?: string;
  chatMessages: Anthropic.MessageParam[];
} {
  const systemParts = messages.filter((m) => m.role === 'system').map((m) => m.content);
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  return {
    system: systemParts.length ? systemParts.join('\n') : undefined,
    chatMessages,
  };
}
