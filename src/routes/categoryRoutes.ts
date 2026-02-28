import { Router } from 'express';

import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import { validateId } from '../middleware/validationMiddleware';

export const createCategoryRoutes = (controller: CategoryController): Router => {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', validateId, controller.getById);
  router.post('/', authMiddleware, requireAdmin, controller.create);
  router.put('/:id', authMiddleware, requireAdmin, validateId, controller.update);
  router.delete('/:id', authMiddleware, requireAdmin, validateId, controller.remove);

  return router;
};
