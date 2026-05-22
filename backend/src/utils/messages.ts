import type { ChatMessage } from '../types';

const ASSISTANT_SYSTEM_PROMPT =
  'You are a helpful, knowledgeable assistant. Answer the user\'s questions clearly, accurately, and in a conversational tone. If you are unsure, say so.';

/** Ensures the model gets a system prompt so it answers questions instead of echoing. */
export function withAssistantSystem(messages: ChatMessage[]): ChatMessage[] {
  if (messages.some((m) => m.role === 'system')) return messages;
  return [{ role: 'system', content: ASSISTANT_SYSTEM_PROMPT }, ...messages];
}
