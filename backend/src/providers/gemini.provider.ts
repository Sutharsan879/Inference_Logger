import {
  GoogleGenerativeAI,
  type Content,
  type EnhancedGenerateContentResponse,
} from '@google/generative-ai';
import { env } from '../config/env';
import type { ChatMessage } from '../types';
import type { LLMProvider, LLMResponse } from './base.provider';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  }

  async complete(messages: ChatMessage[], model = 'gemini-1.5-pro'): Promise<LLMResponse> {
    const { systemInstruction, history, message } = toGeminiInput(messages);
    const genModel = this.client.getGenerativeModel({ model, systemInstruction });
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessage(message);
    return toLLMResponse(result.response, messages, model);
  }

  async stream(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    model = 'gemini-1.5-pro'
  ): Promise<LLMResponse> {
    const { systemInstruction, history, message } = toGeminiInput(messages);
    const genModel = this.client.getGenerativeModel({ model, systemInstruction });
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessageStream(message);

    let content = '';
    for await (const chunk of result.stream) {
      const delta = chunk.text();
      if (delta) {
        content += delta;
        onToken(delta);
      }
    }

    const response = await result.response;
    return {
      content,
      usage: usageFromMetadata(response.usageMetadata, messages, content),
      model,
    };
  }
}

function toGeminiInput(messages: ChatMessage[]): {
  systemInstruction?: string;
  history: Content[];
  message: string;
} {
  const systemParts = messages.filter((m) => m.role === 'system').map((m) => m.content);
  const chat = messages.filter((m) => m.role !== 'system');

  if (!chat.length) {
    return { history: [], message: '' };
  }

  const history: Content[] = chat.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const last = chat[chat.length - 1];
  return {
    systemInstruction: systemParts.length ? systemParts.join('\n') : undefined,
    history,
    message: last.content,
  };
}

function toLLMResponse(
  response: EnhancedGenerateContentResponse,
  messages: ChatMessage[],
  model: string
): LLMResponse {
  const content = response.text();
  return {
    content,
    usage: usageFromMetadata(response.usageMetadata, messages, content),
    model,
  };
}

function usageFromMetadata(
  meta: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } | undefined,
  messages: ChatMessage[],
  content: string
): LLMResponse['usage'] {
  if (meta?.totalTokenCount != null) {
    return {
      prompt_tokens: meta.promptTokenCount ?? 0,
      completion_tokens: meta.candidatesTokenCount ?? 0,
      total_tokens: meta.totalTokenCount,
    };
  }

  const promptText = messages.map((m) => m.content).join('\n');
  const prompt_tokens = Math.ceil(promptText.length / 4);
  const completion_tokens = Math.ceil(content.length / 4);
  return {
    prompt_tokens,
    completion_tokens,
    total_tokens: prompt_tokens + completion_tokens,
  };
}
