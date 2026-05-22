import { env } from '../config/env';
import { eventQueue } from '../ingestion/eventQueue';
import type { LogIngestPayload } from '../types';
import type { Provider } from '../types';
import { piiRedactor } from './piiRedactor';
import type { LLMResponse } from '../providers/base.provider';

interface WrapCallOptions {
  provider: Provider;
  model: string;
  conversationId: string;
  sessionId?: string;
  messageId?: string;
  input: string;
  streaming?: boolean;
  callFn: () => Promise<LLMResponse>;
  getStreamMetrics?: () => { timeToFirstTokenMs?: number };
}

export class LLMLogger {
  async wrapCall({
    provider,
    model,
    conversationId,
    sessionId,
    messageId,
    input,
    callFn,
    getStreamMetrics,
  }: WrapCallOptions): Promise<LLMResponse> {
    const requestTimestamp = new Date();
    const start = Date.now();

    try {
      const result = await callFn();
      const latencyMs = Date.now() - start;
      const timeToFirstTokenMs = getStreamMetrics?.().timeToFirstTokenMs;

      await this.enqueueLog({
        provider,
        model,
        conversationId,
        sessionId,
        messageId,
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens,
        latencyMs,
        timeToFirstTokenMs: timeToFirstTokenMs,
        status: 'success',
        requestTimestamp,
        responseTimestamp: new Date(),
        inputPreview: piiRedactor.redact(input.slice(0, 300)),
        outputPreview: piiRedactor.redact(result.content.slice(0, 300)),
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const timeToFirstTokenMs = getStreamMetrics?.().timeToFirstTokenMs;
      await this.enqueueLog({
        provider,
        model,
        conversationId,
        sessionId,
        messageId,
        latencyMs: Date.now() - start,
        timeToFirstTokenMs,
        status: 'error',
        errorMessage: message,
        requestTimestamp,
        responseTimestamp: new Date(),
        inputPreview: piiRedactor.redact(input.slice(0, 300)),
      });
      throw err;
    }
  }

  /** Fire-and-forget log delivery to ingestion API (near real-time). */
  private async enqueueLog(payload: LogIngestPayload): Promise<void> {
    if (env.INGESTION_MODE === 'queue' || !env.INGESTION_BASE_URL) {
      eventQueue.emit('log', payload);
      return;
    }

    const url = `${env.INGESTION_BASE_URL}/api/logs/ingest`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          requestTimestamp: payload.requestTimestamp.toISOString(),
          responseTimestamp: payload.responseTimestamp.toISOString(),
        }),
      });
      if (!res.ok) {
        console.error('Ingestion HTTP failed:', res.status, await res.text());
        eventQueue.emit('log', payload);
      }
    } catch (err) {
      console.error('Ingestion HTTP error, falling back to queue:', err);
      eventQueue.emit('log', payload);
    }
  }

}

export const logger = new LLMLogger();
