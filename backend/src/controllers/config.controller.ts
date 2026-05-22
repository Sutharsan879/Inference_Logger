import type { Request, Response } from 'express';
import { env } from '../config/env';
import { hasApiKey, isLiveProvider } from '../providers';
import type { Provider } from '../types';

const ALL_PROVIDERS: Provider[] = ['groq', 'openai', 'anthropic', 'gemini'];

export function buildHint(): string {
  if (env.MOCK_LLM) {
    return 'Set MOCK_LLM=false in backend/.env and add an API key for real AI answers.';
  }
  if (!ALL_PROVIDERS.some((p) => hasApiKey(p))) {
    return 'Add GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY to backend/.env for real AI answers.';
  }
  return 'Select a provider that has an API key configured (see badge).';
}

export function getProviderHint(provider: Provider): string {
  if (env.MOCK_LLM) return 'MOCK_LLM=true — set to false in backend/.env';
  if (isLiveProvider(provider)) return `Live ${provider} — real AI answers`;
  if (provider === 'groq' && !hasApiKey('groq')) {
    return 'Add GROQ_API_KEY to backend/.env (free at console.groq.com)';
  }
  if (provider === 'anthropic' && !hasApiKey('anthropic')) {
    return 'Anthropic key missing — switch Provider or add ANTHROPIC_API_KEY to .env';
  }
  if (provider === 'openai' && !hasApiKey('openai')) {
    return 'OpenAI key missing — switch Provider or add OPENAI_API_KEY to .env';
  }
  if (provider === 'gemini' && !hasApiKey('gemini')) {
    return 'Gemini key missing — switch Provider or add GEMINI_API_KEY to .env';
  }
  return 'Mock replies — no API key for this provider';
}

export function getConfigPayload() {
  const providerStatus = Object.fromEntries(
    ALL_PROVIDERS.map((p) => [
      p,
      {
        hasApiKey: hasApiKey(p),
        mode: isLiveProvider(p) ? 'live' : 'mock',
        hint: getProviderHint(p),
      },
    ])
  );

  const defaultProvider = ALL_PROVIDERS.find((p) => isLiveProvider(p)) ?? 'groq';

  return {
    mockLlmForced: env.MOCK_LLM,
    providers: providerStatus,
    defaultProvider,
    hint: buildHint(),
  };
}

export function getConfig(_req: Request, res: Response): void {
  res.json(getConfigPayload());
}
