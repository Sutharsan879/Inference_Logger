import type { Request, Response } from 'express';
import { prisma } from '../db/client';
import type { MetricsSummary } from '../types';

export async function getMetrics(_req: Request, res: Response): Promise<void> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const logs = await prisma.inferenceLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
    include: { conversation: { select: { id: true, title: true } } },
  });

  const totalRequests = logs.length;
  const errors = logs.filter((l: (typeof logs)[number]) => l.status === 'error').length;
  const errorRate = totalRequests ? (errors / totalRequests) * 100 : 0;
  const avgLatencyMs = totalRequests
    ? logs.reduce((s: number, l: (typeof logs)[number]) => s + l.latencyMs, 0) / totalRequests
    : 0;
  const totalTokens = logs.reduce(
    (s: number, l: (typeof logs)[number]) => s + l.totalTokens,
    0
  );

  const bucketMs = 5 * 60 * 1000;
  const rpmMap = new Map<string, number>();
  const latencyMap = new Map<string, { sum: number; count: number }>();

  for (const log of logs) {
    const bucket = new Date(Math.floor(log.createdAt.getTime() / bucketMs) * bucketMs).toISOString();
    rpmMap.set(bucket, (rpmMap.get(bucket) ?? 0) + 1);
    const lat = latencyMap.get(bucket) ?? { sum: 0, count: 0 };
    lat.sum += log.latencyMs;
    lat.count += 1;
    latencyMap.set(bucket, lat);
  }

  const requestsPerMinute = Array.from(rpmMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, count]) => ({ timestamp, count }));

  const latencyOverTime = Array.from(latencyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, { sum, count }]) => ({
      timestamp,
      latencyMs: Math.round(sum / count),
    }));

  const tokenByConv = new Map<string, { title: string; tokens: number }>();
  for (const log of logs) {
    const key = log.conversationId;
    const existing = tokenByConv.get(key) ?? {
      title: log.conversation?.title ?? 'Unknown',
      tokens: 0,
    };
    existing.tokens += log.totalTokens;
    tokenByConv.set(key, existing);
  }

  const tokensPerConversation = Array.from(tokenByConv.entries())
    .map(([conversationId, v]) => ({
      conversationId,
      title: v.title,
      tokens: v.tokens,
    }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 10);

  const providerCounts = new Map<string, number>();
  for (const log of logs) {
    providerCounts.set(log.provider, (providerCounts.get(log.provider) ?? 0) + 1);
  }

  const providerBreakdown = Array.from(providerCounts.entries()).map(([provider, count]) => ({
    provider,
    count,
  }));

  const summary: MetricsSummary = {
    totalRequests,
    errorRate: Math.round(errorRate * 100) / 100,
    avgLatencyMs: Math.round(avgLatencyMs),
    totalTokens,
    requestsPerMinute,
    latencyOverTime,
    tokensPerConversation,
    providerBreakdown,
  };

  res.json(summary);
}
