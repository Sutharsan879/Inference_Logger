import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db/client';
import { logger } from '../sdk/logger';
import { pipeline } from '../ingestion/pipeline';
import { providerFactory, DEFAULT_MODELS } from '../providers';
import { truncateContext } from '../utils/context';
import { withAssistantSystem } from '../utils/messages';
import { env } from '../config/env';
import {
  runStreamChat,
  cancelStreamByConversationId,
} from '../services/stream-chat.service';
import type { ChatMessage, Provider } from '../types';

export async function streamChat(req: Request, res: Response): Promise<void> {
  const body = req.body as {
    messages: ChatMessage[];
    provider: Provider;
    model?: string;
    conversationId?: string;
    sessionId?: string;
  };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  await runStreamChat(body, (event) => {
    if ('conversationId' in event && 'sessionId' in event) {
      res.setHeader('X-Conversation-Id', event.conversationId);
      res.setHeader('X-Session-Id', event.sessionId);
    }
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
  res.end();
}

export async function completeChat(req: Request, res: Response): Promise<void> {
  const { messages, provider, model, conversationId, sessionId } = req.body;
  const resolvedModel = model ?? DEFAULT_MODELS[provider as Provider];

  let convId = conversationId ?? '';
  let resolvedSessionId = sessionId ?? '';

  if (!convId) {
    const conv = await prisma.conversation.create({
      data: {
        sessionId: sessionId ?? uuidv4(),
        title: messages.at(-1)?.content.slice(0, 60) || 'New conversation',
        provider,
        model: resolvedModel,
      },
    });
    convId = conv.id;
    resolvedSessionId = conv.sessionId;
  } else {
    const conv = await prisma.conversation.findUniqueOrThrow({ where: { id: convId } });
    resolvedSessionId = conv.sessionId;
  }

  const contextMessages = withAssistantSystem(
    truncateContext(messages, env.MAX_CONTEXT_MESSAGES)
  );
  const llmProvider = providerFactory.get(provider);
  const result = await logger.wrapCall({
    provider,
    model: resolvedModel,
    conversationId: convId,
    sessionId: resolvedSessionId,
    input: messages.at(-1)?.content ?? '',
    callFn: () => llmProvider.complete(contextMessages, resolvedModel),
  });

  const assistantMsg = await prisma.message.create({
    data: { conversationId: convId, role: 'assistant', content: result.content },
  });

  res.json({
    conversationId: convId,
    sessionId: resolvedSessionId,
    message: assistantMsg,
    content: result.content,
    usage: result.usage,
  });
}

export async function cancelStream(req: Request, res: Response): Promise<void> {
  const { conversationId } = req.body;
  await cancelStreamByConversationId(conversationId);
  res.json({ cancelled: true });
}
