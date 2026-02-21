import { Router } from 'express';

import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateId, validateProduct } from '../middleware/validationMiddleware';

export const createProductRoutes = (controller: ProductController): Router => {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/low-stock', authMiddleware, controller.getLowStock);
  router.get('/:id', validateId, controller.getById);
  router.post('/', authMiddleware, validateProduct, controller.create);
  router.put('/:id', authMiddleware, validateId, controller.update);
  router.delete('/:id', authMiddleware, validateId, controller.remove);

  return router;
};
