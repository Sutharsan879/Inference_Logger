import type { ChatMessage } from '../types';

/** Keeps short conversational context for multi-turn chat (assignment requirement). */
export function truncateContext(messages: ChatMessage[], maxMessages = 20): ChatMessage[] {
  if (messages.length <= maxMessages) return messages;

  const system = messages.filter((m) => m.role === 'system');
  const nonSystem = messages.filter((m) => m.role !== 'system');
  const recent = nonSystem.slice(-maxMessages);

  return [...system, ...recent];
}
