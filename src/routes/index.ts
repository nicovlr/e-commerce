import { Router } from 'express';

import { AIController } from '../controllers/AIController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { AuthController } from '../controllers/AuthController';
import { CategoryController } from '../controllers/CategoryController';
import { OrderController } from '../controllers/OrderController';
import { ProductController } from '../controllers/ProductController';
import { createAdminMiddleware } from '../middleware/adminMiddleware';

import { createAIRoutes } from './aiRoutes';
import { createAnalyticsRoutes } from './analyticsRoutes';
import { createAuthRoutes } from './authRoutes';
import { createCategoryRoutes } from './categoryRoutes';
import { createOrderRoutes } from './orderRoutes';
import { createProductRoutes } from './productRoutes';

export const createApiRoutes = (
  productController: ProductController,
  authController: AuthController,
  orderController: OrderController,
  categoryController: CategoryController,
  aiController: AIController,
  analyticsController: AnalyticsController,
  adminMiddleware: ReturnType<typeof createAdminMiddleware>,
): Router => {
  const router = Router();

  router.use('/products', createProductRoutes(productController));
  router.use('/auth', createAuthRoutes(authController));
  router.use('/orders', createOrderRoutes(orderController));
  router.use('/categories', createCategoryRoutes(categoryController));
  router.use('/ai', createAIRoutes(aiController));
  router.use('/analytics', createAnalyticsRoutes(analyticsController, adminMiddleware));

  return router;
};
