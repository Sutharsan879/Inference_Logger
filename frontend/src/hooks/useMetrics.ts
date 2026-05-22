'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MetricsSummary } from '@/types';

export function useMetrics(pollIntervalMs = 30000) {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await api.metrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, pollIntervalMs);
    return () => clearInterval(id);
  }, [fetchMetrics, pollIntervalMs]);

  return { metrics, loading, error, refresh: fetchMetrics };
}
