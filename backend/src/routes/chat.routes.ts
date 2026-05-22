import { Router } from 'express';
import { z } from 'zod';
import { cancelStream, completeChat, streamChat } from '../controllers/chat.controller';
import { validateBody } from '../middleware/validateRequest';
import { asyncHandler } from '../middleware/asyncHandler';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

const chatBodySchema = z.object({
  messages: z.array(messageSchema).min(1),
  provider: z.enum(['anthropic', 'openai', 'gemini']),
  model: z.string().optional(),
  conversationId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

const cancelSchema = z.object({
  conversationId: z.string().uuid(),
});

export const chatRoutes = Router();

chatRoutes.post('/stream', validateBody(chatBodySchema), asyncHandler(streamChat));
chatRoutes.post('/complete', validateBody(chatBodySchema), asyncHandler(completeChat));
chatRoutes.post('/cancel', validateBody(cancelSchema), asyncHandler(cancelStream));
