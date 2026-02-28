import { Router } from 'express';

import { ProductController } from '../controllers/ProductController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import { validateId, validateProduct } from '../middleware/validationMiddleware';

export const createProductRoutes = (controller: ProductController): Router => {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/low-stock', authMiddleware, requireAdmin, controller.getLowStock);
  router.get('/:id', validateId, controller.getById);
  router.post('/', authMiddleware, requireAdmin, validateProduct, controller.create);
  router.put('/:id', authMiddleware, requireAdmin, validateId, controller.update);
  router.delete('/:id', authMiddleware, requireAdmin, validateId, controller.remove);

  return router;
};
