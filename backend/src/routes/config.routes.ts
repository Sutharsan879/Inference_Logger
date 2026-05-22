import { Router } from 'express';
import { getConfig } from '../controllers/config.controller';

export const configRoutes = Router();

configRoutes.get('/', getConfig);
