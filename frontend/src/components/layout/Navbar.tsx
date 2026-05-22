'use client';

import { useEffect, useState } from 'react';
import type { Provider } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
];

const MODELS: Record<Provider, string[]> = {
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-sonnet-4-20250514'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
};

interface NavbarProps {
  provider: Provider;
  model: string;
  onProviderChange: (p: Provider) => void;
  onModelChange: (m: string) => void;
}

export function Navbar({ provider, model, onProviderChange, onModelChange }: NavbarProps) {
  const [aiMode, setAiMode] = useState<'live' | 'mock'>('mock');
  const [hint, setHint] = useState('');

  useEffect(() => {
    api.config()
      .then((c) => {
        setAiMode(c.providers[provider]?.mode ?? 'mock');
        setHint(c.providers[provider]?.hint ?? c.hint);
      })
      .catch(() => setAiMode('mock'));
  }, [provider]);

  return (
    <header className="shrink-0 border-b border-surface-border bg-surface-elevated px-3 py-2.5 sm:px-4 md:px-6 md:py-3">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex flex-wrap items-end gap-2 sm:gap-3 md:gap-4">
          <div className="flex min-w-0 flex-1 basis-[calc(50%-0.25rem)] flex-col gap-1 sm:basis-auto sm:flex-row sm:items-center sm:gap-2">
            <label className="text-xs text-gray-500">Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const p = e.target.value as Provider;
                onProviderChange(p);
                onModelChange(MODELS[p][0]);
              }}
              className="w-full min-w-0 rounded-lg border border-surface-border bg-surface px-2 py-1.5 text-sm text-gray-200 sm:w-auto sm:min-w-[8rem] sm:px-3"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-0 flex-1 basis-[calc(50%-0.25rem)] flex-col gap-1 sm:basis-auto sm:flex-row sm:items-center sm:gap-2">
            <label className="text-xs text-gray-500">Model</label>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-surface-border bg-surface px-2 py-1.5 text-sm text-gray-200 sm:w-auto sm:min-w-[10rem] sm:max-w-[14rem] sm:px-3 md:max-w-none"
            >
              {MODELS[provider].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <Badge
            variant={aiMode === 'live' ? 'success' : 'warning'}
            className="w-full justify-center sm:ml-auto sm:w-auto"
          >
            {aiMode === 'live' ? 'Live AI' : 'Mock replies'}
          </Badge>
        </div>
        {aiMode === 'mock' && hint && (
          <p className="text-xs leading-relaxed text-amber-400/90">{hint}</p>
        )}
      </div>
    </header>
  );
}
