import type { Provider } from '@/types';

/** Config for UI — reads process.env only (no DATABASE_URL required). */
export function getRuntimeConfigPayload() {
  const mockLlm =
    process.env.MOCK_LLM === 'true' || process.env.MOCK_LLM === '1';
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  const providers: Provider[] = ['groq', 'anthropic', 'openai', 'gemini'];

  const hasKeyFor = (p: Provider): boolean => {
    switch (p) {
      case 'groq':
        return Boolean(groqKey);
      case 'openai':
        return Boolean(openaiKey);
      case 'anthropic':
        return Boolean(anthropicKey);
      case 'gemini':
        return Boolean(geminiKey);
    }
  };

  const hintForMissing = (p: Provider): string => {
    switch (p) {
      case 'groq':
        return 'Add GROQ_API_KEY on Vercel (console.groq.com)';
      case 'openai':
        return 'Add OPENAI_API_KEY on Vercel';
      case 'anthropic':
        return 'Add ANTHROPIC_API_KEY on Vercel';
      case 'gemini':
        return 'Add GEMINI_API_KEY on Vercel';
    }
  };

  const providerStatus = Object.fromEntries(
    providers.map((p) => {
      const hasKey = hasKeyFor(p);
      const live = !mockLlm && hasKey;
      return [
        p,
        {
          hasApiKey: hasKey,
          mode: live ? 'live' : 'mock',
          hint: live ? `Live ${p}` : mockLlm ? 'MOCK_LLM=true on Vercel' : hintForMissing(p),
        },
      ];
    })
  );

  const defaultProvider: Provider =
    groqKey && !mockLlm
      ? 'groq'
      : openaiKey && !mockLlm
        ? 'openai'
        : anthropicKey && !mockLlm
          ? 'anthropic'
          : geminiKey && !mockLlm
            ? 'gemini'
            : 'groq';

  const anyKey = groqKey || openaiKey || anthropicKey || geminiKey;

  return {
    mockLlmForced: mockLlm,
    providers: providerStatus,
    defaultProvider,
    hint: mockLlm
      ? 'MOCK_LLM=true — set to false and add API keys for live AI'
      : anyKey
        ? 'Select a provider with an API key'
        : 'Add GROQ_API_KEY (or other provider keys) on Vercel',
  };
}
