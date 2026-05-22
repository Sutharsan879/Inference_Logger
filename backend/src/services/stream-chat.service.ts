import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db/client';
import { env } from '../config/env';
import { logger } from '../sdk/logger';
import { pipeline } from '../ingestion/pipeline';
import { providerFactory, DEFAULT_MODELS } from '../providers';
import { truncateContext } from '../utils/context';
import { withAssistantSystem } from '../utils/messages';
import type { ChatMessage, Provider } from '../types';

export interface StreamChatInput {
  messages: ChatMessage[];
  provider: Provider;
  model?: string;
  conversationId?: string;
  sessionId?: string;
}

export type StreamEvent =
  | { conversationId: string; sessionId: string }
  | { token: string }
  | { done: true; usage: object; messageId: string; timeToFirstTokenMs?: number }
  | { error: string }
  | { cancelled: true };

const activeStreams = new Map<string, AbortController>();

export function cancelActiveStream(conversationId: string): void {
  activeStreams.get(conversationId)?.abort();
  activeStreams.delete(conversationId);
}

export async function runStreamChat(
  input: StreamChatInput,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const { messages, provider, model, conversationId, sessionId } = input;
  const resolvedModel = model ?? DEFAULT_MODELS[provider];
  let convId = conversationId ?? '';
  let resolvedSessionId = sessionId ?? '';

  if (!convId) {
    const conv = await prisma.conversation.create({
      data: {
        sessionId: sessionId ?? uuidv4(),
        title: messages.at(-1)?.content.slice(0, 60) || 'New conversation',
        provider,
        model: resolvedModel,
        status: 'active',
      },
    });
    convId = conv.id;
    resolvedSessionId = conv.sessionId;
  } else {
    const conv = await prisma.conversation.findUniqueOrThrow({ where: { id: convId } });
    resolvedSessionId = conv.sessionId;
    await prisma.conversation.update({
      where: { id: convId },
      data: { status: 'active' },
    });
  }

  const contextMessages = withAssistantSystem(
    truncateContext(messages, env.MAX_CONTEXT_MESSAGES)
  );

  const lastUser = messages.filter((m) => m.role === 'user').at(-1);
  if (lastUser) {
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: lastUser.content,
        rawContent: lastUser.content,
      },
    });
  }

  const abortController = new AbortController();
  activeStreams.set(convId, abortController);

  onEvent({ conversationId: convId, sessionId: resolvedSessionId });

  const llmProvider = providerFactory.get(provider);
  const streamMetrics = { timeToFirstTokenMs: undefined as number | undefined };

  try {
    const result = await logger.wrapCall({
      provider,
      model: resolvedModel,
      conversationId: convId,
      sessionId: resolvedSessionId,
      input: messages.at(-1)?.content ?? '',
      streaming: true,
      callFn: async () => {
        const streamStart = Date.now();
        return llmProvider.stream(
          contextMessages,
          (token) => {
            if (streamMetrics.timeToFirstTokenMs === undefined) {
              streamMetrics.timeToFirstTokenMs = Date.now() - streamStart;
            }
            if (!abortController.signal.aborted) {
              onEvent({ token });
            }
          },
          resolvedModel
        );
      },
      getStreamMetrics: () => streamMetrics,
    });

    if (abortController.signal.aborted) {
      await prisma.conversation.update({
        where: { id: convId },
        data: { status: 'cancelled' },
      });
      onEvent({ cancelled: true });
      return;
    }

    const assistantMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: result.content,
        rawContent: result.content,
      },
    });

    await linkLatestLogToMessage(convId, assistantMsg.id);

    if (streamMetrics.timeToFirstTokenMs !== undefined) {
      await prisma.inferenceLog.updateMany({
        where: { conversationId: convId, messageId: assistantMsg.id },
        data: { timeToFirstTokenMs: streamMetrics.timeToFirstTokenMs },
      });
    }

    await prisma.conversation.update({
      where: { id: convId },
      data: { status: 'completed', updatedAt: new Date() },
    });

    onEvent({
      done: true,
      usage: result.usage,
      messageId: assistantMsg.id,
      timeToFirstTokenMs: streamMetrics.timeToFirstTokenMs,
    });
  } catch (err) {
    if (abortController.signal.aborted) {
      await prisma.conversation.update({
        where: { id: convId },
        data: { status: 'cancelled' },
      });
      onEvent({ cancelled: true });
      return;
    }
    onEvent({ error: err instanceof Error ? err.message : 'Stream failed' });
  } finally {
    activeStreams.delete(convId);
  }
}

async function linkLatestLogToMessage(conversationId: string, messageId: string): Promise<void> {
  for (let i = 0; i < 5; i++) {
    const log = await prisma.inferenceLog.findFirst({
      where: { conversationId, messageId: null },
      orderBy: { createdAt: 'desc' },
    });
    if (log) {
      await pipeline.linkMessage(log.id, messageId);
      return;
    }
    await new Promise((r) => setTimeout(r, 100 * (i + 1)));
  }
}

export async function cancelStreamByConversationId(conversationId: string): Promise<void> {
  cancelActiveStream(conversationId);
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'cancelled' },
  });
}
