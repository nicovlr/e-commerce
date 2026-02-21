import { Router } from 'express';

import { AIController } from '../controllers/AIController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createAIRoutes = (controller: AIController): Router => {
  const router = Router();

  router.post('/predict', authMiddleware, controller.predict);
  router.get('/alerts', authMiddleware, controller.getAlerts);
  router.get('/health', controller.healthCheck);

  return router;
};
