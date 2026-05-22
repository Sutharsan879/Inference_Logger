import type { Request, Response } from 'express';
import { prisma } from '../db/client';
import { AppError } from '../middleware/errorHandler';

export async function listConversations(req: Request, res: Response): Promise<void> {
  const { search, status, provider, limit = '50', offset = '0' } = req.query as Record<
    string,
    string | undefined
  >;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (provider) where.provider = provider;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { sessionId: { contains: search } },
    ];
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
        _count: { select: { messages: true, logs: true } },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  res.json({ conversations, total });
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      logs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found');
  }

  res.json(conversation);
}

export async function createConversation(req: Request, res: Response): Promise<void> {
  const { sessionId, title, provider, model } = req.body;
  const conversation = await prisma.conversation.create({
    data: { sessionId, title, provider, model },
  });
  res.status(201).json(conversation);
}

export async function cancelConversation(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const conversation = await prisma.conversation.update({
    where: { id },
    data: { status: 'cancelled' },
  });
  res.json(conversation);
}

export async function deleteConversation(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await prisma.conversation.delete({ where: { id } });
  res.status(204).send();
}
