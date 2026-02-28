import { Router } from 'express';

import { OrderController } from '../controllers/OrderController';
import { authMiddleware, requireStaff } from '../middleware/authMiddleware';
import { validateId, validateOrder } from '../middleware/validationMiddleware';

export const createOrderRoutes = (controller: OrderController): Router => {
  const router = Router();

  router.post('/', authMiddleware, validateOrder, controller.create);
  router.get('/my-orders', authMiddleware, controller.getUserOrders);
  router.get('/', authMiddleware, requireStaff, controller.getAll);
  router.get('/:id', authMiddleware, validateId, controller.getById);
  router.patch('/:id/status', authMiddleware, requireStaff, validateId, controller.updateStatus);

  return router;
};
