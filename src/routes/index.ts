import { Router } from 'express';

import { AIController } from '../controllers/AIController';
import { AuthController } from '../controllers/AuthController';
import { CategoryController } from '../controllers/CategoryController';
import { OrderController } from '../controllers/OrderController';
import { ProductController } from '../controllers/ProductController';

import { createAIRoutes } from './aiRoutes';
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
): Router => {
  const router = Router();

  router.use('/products', createProductRoutes(productController));
  router.use('/auth', createAuthRoutes(authController));
  router.use('/orders', createOrderRoutes(orderController));
  router.use('/categories', createCategoryRoutes(categoryController));
  router.use('/ai', createAIRoutes(aiController));

  return router;
};
