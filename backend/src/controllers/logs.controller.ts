import type { Request, Response } from 'express';
import { eventQueue } from '../ingestion/eventQueue';
import { pipeline } from '../ingestion/pipeline';
import { prisma } from '../db/client';

export async function ingestLog(req: Request, res: Response): Promise<void> {
  const payload = pipeline.validateAndNormalize(req.body);
  eventQueue.emit('log', payload);
  res.status(202).json({ accepted: true, conversationId: payload.conversationId });
}

export async function listLogs(req: Request, res: Response): Promise<void> {
  const {
    conversationId,
    sessionId,
    provider,
    status,
    limit = '100',
    offset = '0',
  } = req.query as Record<string, string | undefined>;

  const where: Record<string, unknown> = {};
  if (conversationId) where.conversationId = conversationId;
  if (sessionId) where.sessionId = sessionId;
  if (provider) where.provider = provider;
  if (status) where.status = status;

  const [logs, total] = await Promise.all([
    prisma.inferenceLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
      include: {
        conversation: { select: { id: true, title: true, sessionId: true } },
      },
    }),
    prisma.inferenceLog.count({ where }),
  ]);

  res.json({ logs, total });
}

export async function getLog(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const log = await prisma.inferenceLog.findUnique({
    where: { id },
    include: { conversation: true, message: true },
  });

  if (!log) {
    res.status(404).json({ error: 'Log not found' });
    return;
  }

  res.json(log);
}
