import { prisma } from '../db/client';
import { piiRedactor } from '../sdk/piiRedactor';
import type { LogIngestPayload } from '../types';
import { logIngestSchema, type LogIngestInput } from './schemas';

class IngestionPipeline {
  validateAndNormalize(raw: unknown): LogIngestPayload {
    const parsed: LogIngestInput = logIngestSchema.parse(raw);
    return {
      ...parsed,
      inputPreview: parsed.inputPreview
        ? piiRedactor.redact(parsed.inputPreview)
        : undefined,
      outputPreview: parsed.outputPreview
        ? piiRedactor.redact(parsed.outputPreview)
        : undefined,
    };
  }

  async ingest(payload: LogIngestPayload): Promise<{ id: string }> {
    const log = await prisma.inferenceLog.create({
      data: {
        conversationId: payload.conversationId,
        sessionId: payload.sessionId,
        messageId: payload.messageId,
        provider: payload.provider,
        model: payload.model,
        promptTokens: payload.promptTokens ?? 0,
        completionTokens: payload.completionTokens ?? 0,
        totalTokens: payload.totalTokens ?? 0,
        latencyMs: payload.latencyMs,
        timeToFirstTokenMs: payload.timeToFirstTokenMs,
        status: payload.status,
        errorMessage: payload.errorMessage,
        requestTimestamp: payload.requestTimestamp,
        responseTimestamp: payload.responseTimestamp,
        inputPreview: payload.inputPreview,
        outputPreview: payload.outputPreview,
      },
    });
    return { id: log.id };
  }

  async linkMessage(logId: string, messageId: string): Promise<void> {
    await prisma.inferenceLog.update({
      where: { id: logId },
      data: { messageId },
    });
  }
}

export const pipeline = new IngestionPipeline();
