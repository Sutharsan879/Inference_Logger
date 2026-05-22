import type { Provider } from '@/types';

/** Config for UI — reads process.env only (no DATABASE_URL required). */
export function getRuntimeConfigPayload() {
  const mockLlm =
    process.env.MOCK_LLM === 'true' || process.env.MOCK_LLM === '1';
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  const providers: Provider[] = ['anthropic', 'openai', 'gemini'];

  const providerStatus = Object.fromEntries(
    providers.map((p) => {
      const hasKey =
        p === 'openai'
          ? Boolean(openaiKey)
          : p === 'anthropic'
            ? Boolean(anthropicKey)
            : Boolean(geminiKey);
      const live = !mockLlm && hasKey;
      return [
        p,
        {
          hasApiKey: hasKey,
          mode: live ? 'live' : 'mock',
          hint: live
            ? `Live ${p}`
            : mockLlm
              ? 'MOCK_LLM=true on Vercel'
              : p === 'openai'
                ? 'Add OPENAI_API_KEY on Vercel'
                : p === 'anthropic'
                  ? 'Add ANTHROPIC_API_KEY or use another provider'
                  : 'Add GEMINI_API_KEY on Vercel (aistudio.google.com/apikey)',
        },
      ];
    })
  );

  const defaultProvider: Provider =
    openaiKey && !mockLlm
      ? 'openai'
      : anthropicKey && !mockLlm
        ? 'anthropic'
        : geminiKey && !mockLlm
          ? 'gemini'
          : 'openai';

  return {
    mockLlmForced: mockLlm,
    providers: providerStatus,
    defaultProvider,
    hint: mockLlm
      ? 'MOCK_LLM=true — set to false and add API keys for live AI'
      : openaiKey || anthropicKey || geminiKey
        ? 'Select a provider with an API key'
        : 'Add OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY on Vercel',
  };
}
