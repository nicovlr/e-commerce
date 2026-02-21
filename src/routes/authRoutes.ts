import { Router } from 'express';

import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateLogin, validateRegister } from '../middleware/validationMiddleware';

export const createAuthRoutes = (controller: AuthController): Router => {
  const router = Router();

  router.post('/register', validateRegister, controller.register);
  router.post('/login', validateLogin, controller.login);
  router.get('/profile', authMiddleware, controller.getProfile);

  return router;
};
