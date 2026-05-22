import { z } from 'zod';

export const logIngestSchema = z.object({
  conversationId: z.string().uuid(),
  sessionId: z.string().optional(),
  messageId: z.string().uuid().optional(),
  provider: z.enum(['anthropic', 'openai', 'gemini']),
  model: z.string().min(1),
  promptTokens: z.number().int().nonnegative().optional(),
  completionTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
  latencyMs: z.number().nonnegative(),
  timeToFirstTokenMs: z.number().nonnegative().optional(),
  status: z.enum(['success', 'error', 'cancelled']),
  errorMessage: z.string().optional(),
  requestTimestamp: z.coerce.date(),
  responseTimestamp: z.coerce.date(),
  inputPreview: z.string().max(300).optional(),
  outputPreview: z.string().max(300).optional(),
});

export type LogIngestInput = z.infer<typeof logIngestSchema>;
