import { EventEmitter } from 'events';
import { pipeline } from './pipeline';
import type { LogIngestPayload } from '../types';

export const eventQueue = new EventEmitter();
eventQueue.setMaxListeners(50);

export function startQueueWorker(): void {
  eventQueue.on('log', async (payload: LogIngestPayload) => {
    try {
      await pipeline.ingest(payload);
    } catch (err) {
      console.error('Log ingestion failed:', err);
    }
  });
}
