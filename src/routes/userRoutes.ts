import { Router } from 'express';

import { UserController } from '../controllers/UserController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import { validateId } from '../middleware/validationMiddleware';

export const createUserRoutes = (controller: UserController): Router => {
  const router = Router();

  router.get('/', authMiddleware, requireAdmin, controller.getAll);
  router.patch('/:id/role', authMiddleware, requireAdmin, validateId, controller.updateRole);

  return router;
};
