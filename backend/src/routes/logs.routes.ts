import { Router } from 'express';
import { getLog, ingestLog, listLogs } from '../controllers/logs.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { logIngestSchema } from '../ingestion/schemas';
import { validateBody } from '../middleware/validateRequest';

export const logsRoutes = Router();

logsRoutes.post('/ingest', validateBody(logIngestSchema), asyncHandler(ingestLog));
logsRoutes.get('/', asyncHandler(listLogs));
logsRoutes.get('/:id', asyncHandler(getLog));
