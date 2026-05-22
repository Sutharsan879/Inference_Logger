import { Router } from 'express';
import { getMetrics } from '../controllers/metrics.controller';
import { asyncHandler } from '../middleware/asyncHandler';

export const metricsRoutes = Router();

metricsRoutes.get('/', asyncHandler(getMetrics));
