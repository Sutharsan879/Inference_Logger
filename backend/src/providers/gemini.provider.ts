import {
  GoogleGenerativeAI,
  type Content,
  type EnhancedGenerateContentResponse,
} from '@google/generative-ai';
import { env } from '../config/env';
import type { ChatMessage } from '../types';
import type { LLMProvider, LLMResponse } from './base.provider';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  }

  async complete(messages: ChatMessage[], model = DEFAULT_MODEL): Promise<LLMResponse> {
    return withGeminiCall(() => this.runComplete(messages, model));
  }

  async stream(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    model = DEFAULT_MODEL
  ): Promise<LLMResponse> {
    return withGeminiCall(() => this.runStream(messages, onToken, model));
  }

  private async runComplete(messages: ChatMessage[], model: string): Promise<LLMResponse> {
    const { systemInstruction, history, message } = toGeminiInput(messages);
    const genModel = this.client.getGenerativeModel({ model, systemInstruction });
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessage(message);
    return toLLMResponse(result.response, messages, model);
  }

  private async runStream(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    model: string
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

async function withGeminiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const retrySec = parseRetrySeconds(msg);
    if (retrySec != null && isRateLimitError(msg)) {
      await delay((retrySec + 1) * 1000);
      try {
        return await fn();
      } catch (retryErr) {
        throw formatGeminiError(retryErr);
      }
    }
    throw formatGeminiError(err);
  }
}

function isRateLimitError(msg: string): boolean {
  return msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED');
}

function parseRetrySeconds(msg: string): number | null {
  const match = msg.match(/retry in ([\d.]+)s/i);
  return match ? Number(match[1]) : null;
}

function formatGeminiError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (!isRateLimitError(msg)) {
    return err instanceof Error ? err : new Error(msg);
  }
  if (msg.includes('limit: 0')) {
    return new Error(
      'Gemini free tier is not enabled for this API key (quota limit: 0). ' +
        'In Google AI Studio: open your project → Billing → link a billing account (free tier still applies), ' +
        'or create a new key at https://aistudio.google.com/apikey. ' +
        'Then try model gemini-2.5-flash.'
    );
  }
  const wait = parseRetrySeconds(msg);
  const waitHint = wait != null ? ` Wait ~${Math.ceil(wait)}s and try again.` : '';
  return new Error(`Gemini rate limit exceeded.${waitHint} Try gemini-2.5-flash or fewer messages per minute.`);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
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
