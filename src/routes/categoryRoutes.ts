import { Router } from 'express';

import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware, requireStaff } from '../middleware/authMiddleware';
import { validateId } from '../middleware/validationMiddleware';

export const createCategoryRoutes = (controller: CategoryController): Router => {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', validateId, controller.getById);
  router.post('/', authMiddleware, requireStaff, controller.create);
  router.put('/:id', authMiddleware, requireStaff, validateId, controller.update);
  router.delete('/:id', authMiddleware, requireStaff, validateId, controller.remove);

  return router;
};
