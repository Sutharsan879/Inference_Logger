import { Router } from 'express';
import { z } from 'zod';
import {
  cancelConversation,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
} from '../controllers/conversations.controller';
import { validateBody } from '../middleware/validateRequest';
import { asyncHandler } from '../middleware/asyncHandler';

const createSchema = z.object({
  sessionId: z.string().min(1),
  title: z.string().min(1),
  provider: z.enum(['anthropic', 'openai', 'gemini', 'groq']),
  model: z.string().min(1),
});

export const conversationRoutes = Router();

conversationRoutes.get('/', asyncHandler(listConversations));
conversationRoutes.get('/:id', asyncHandler(getConversation));
conversationRoutes.post('/', validateBody(createSchema), asyncHandler(createConversation));
conversationRoutes.post('/:id/cancel', asyncHandler(cancelConversation));
conversationRoutes.delete('/:id', asyncHandler(deleteConversation));
