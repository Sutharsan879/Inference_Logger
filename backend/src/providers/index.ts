import type { Provider } from '../types';
import { env } from '../config/env';
import type { LLMProvider } from './base.provider';
import { AnthropicProvider } from './anthropic.provider';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { MockProvider } from './mock.provider';

const mock = new MockProvider();

export function hasApiKey(provider: Provider): boolean {
  switch (provider) {
    case 'anthropic':
      return Boolean(env.ANTHROPIC_API_KEY?.trim());
    case 'openai':
      return Boolean(env.OPENAI_API_KEY?.trim());
    case 'gemini':
      return Boolean(env.GEMINI_API_KEY?.trim());
    default:
      return false;
  }
}

export function isLiveProvider(provider: Provider): boolean {
  return !env.MOCK_LLM && hasApiKey(provider);
}

class ProviderFactory {
  get(provider: Provider): LLMProvider {
    if (env.MOCK_LLM) {
      return mock;
    }

    switch (provider) {
      case 'anthropic':
        if (!hasApiKey('anthropic')) {
          console.warn('ANTHROPIC_API_KEY missing — using mock. Add key to backend/.env for real answers.');
          return mock;
        }
        return new AnthropicProvider();
      case 'openai':
        if (!hasApiKey('openai')) {
          console.warn('OPENAI_API_KEY missing — using mock. Add key to backend/.env for real answers.');
          return mock;
        }
        return new OpenAIProvider();
      case 'gemini':
        if (!hasApiKey('gemini')) {
          console.warn('GEMINI_API_KEY missing — using mock. Add key to backend/.env for real answers.');
          return mock;
        }
        return new GeminiProvider();
      default:
        return mock;
    }
  }

  getMode(provider: Provider): 'live' | 'mock' {
    return this.get(provider) instanceof MockProvider ? 'mock' : 'live';
  }
}

export const providerFactory = new ProviderFactory();

export const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
};
