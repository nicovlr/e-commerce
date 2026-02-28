import { Router } from 'express';

import { WebhookController } from '../controllers/WebhookController';

export const createWebhookRoutes = (webhookController: WebhookController): Router => {
  const router = Router();

  router.post('/stripe', webhookController.handleStripeWebhook);

  return router;
};
