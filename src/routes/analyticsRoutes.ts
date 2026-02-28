import { Router } from 'express';

import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createAnalyticsRoutes = (
  controller: AnalyticsController,
  adminMiddleware: ReturnType<typeof import('../middleware/adminMiddleware').createAdminMiddleware>,
): Router => {
  const router = Router();

  router.get('/summary', authMiddleware, adminMiddleware, controller.getSummary);
  router.get('/revenue', authMiddleware, adminMiddleware, controller.getRevenue);
  router.get('/top-products', authMiddleware, adminMiddleware, controller.getTopProducts);
  router.get('/orders', authMiddleware, adminMiddleware, controller.getOrders);
  router.get('/customers', authMiddleware, adminMiddleware, controller.getCustomers);
  router.get('/stock', authMiddleware, adminMiddleware, controller.getStock);

  return router;
};
