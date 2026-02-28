import { Router } from 'express';

import { AIController } from '../controllers/AIController';
import { authMiddleware, requireStaff } from '../middleware/authMiddleware';

export const createAIRoutes = (controller: AIController): Router => {
  const router = Router();

  router.post('/predict', authMiddleware, requireStaff, controller.predict);
  router.get('/alerts', authMiddleware, requireStaff, controller.getAlerts);
  router.get('/health', controller.healthCheck);

  return router;
};
