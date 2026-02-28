import { Router } from 'express';

import { ProductController } from '../controllers/ProductController';
import { authMiddleware, requireStaff } from '../middleware/authMiddleware';
import { validateId, validateProduct } from '../middleware/validationMiddleware';

export const createProductRoutes = (controller: ProductController): Router => {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/low-stock', authMiddleware, requireStaff, controller.getLowStock);
  router.get('/:id', validateId, controller.getById);
  router.post('/', authMiddleware, requireStaff, validateProduct, controller.create);
  router.put('/:id', authMiddleware, requireStaff, validateId, controller.update);
  router.delete('/:id', authMiddleware, requireStaff, validateId, controller.remove);

  return router;
};
