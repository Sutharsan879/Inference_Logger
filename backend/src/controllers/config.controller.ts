import type { Request, Response } from 'express';
import { env } from '../config/env';
import { hasApiKey, isLiveProvider } from '../providers';
import type { Provider } from '../types';

export function buildHint(): string {
  if (env.MOCK_LLM) {
    return 'Set MOCK_LLM=false in backend/.env and add an API key for real AI answers.';
  }
  if (!hasApiKey('anthropic') && !hasApiKey('openai') && !hasApiKey('gemini')) {
    return 'Add ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to backend/.env for real AI answers.';
  }
  return 'Select a provider that has an API key configured (see badge).';
}

export function getProviderHint(provider: Provider): string {
  if (env.MOCK_LLM) return 'MOCK_LLM=true — set to false in backend/.env';
  if (isLiveProvider(provider)) return `Live ${provider} — real AI answers`;
  if (provider === 'anthropic' && !hasApiKey('anthropic')) {
    return hasApiKey('openai')
      ? 'Anthropic key missing — switch Provider to OpenAI, or add ANTHROPIC_API_KEY to .env'
      : 'Add ANTHROPIC_API_KEY to backend/.env';
  }
  if (provider === 'openai' && !hasApiKey('openai')) {
    return hasApiKey('anthropic') || hasApiKey('gemini')
      ? 'OpenAI key missing — switch Provider, or add OPENAI_API_KEY to .env'
      : 'Add OPENAI_API_KEY to backend/.env';
  }
  if (provider === 'gemini' && !hasApiKey('gemini')) {
    return hasApiKey('openai') || hasApiKey('anthropic')
      ? 'Gemini key missing — switch Provider, or add GEMINI_API_KEY to .env'
      : 'Add GEMINI_API_KEY to backend/.env (free at aistudio.google.com/apikey)';
  }
  return 'Mock replies — no API key for this provider';
}

export function getConfigPayload() {
  const providers: Provider[] = ['anthropic', 'openai', 'gemini'];
  const providerStatus = Object.fromEntries(
    providers.map((p) => [
      p,
      {
        hasApiKey: hasApiKey(p),
        mode: isLiveProvider(p) ? 'live' : 'mock',
        hint: getProviderHint(p),
      },
    ])
  );

  const defaultProvider =
    (['openai', 'anthropic', 'gemini'] as Provider[]).find((p) => isLiveProvider(p)) ??
    'anthropic';

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
