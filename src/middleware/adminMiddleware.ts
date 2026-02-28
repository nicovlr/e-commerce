import { Response, NextFunction } from 'express';

import { logger } from '../config/logger';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { AuthRequest, UserRole } from '../types';

export const createAdminMiddleware = (userRepository: UserRepository) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user: User | null = await userRepository.findById(req.userId);
      if (!user || user.role !== UserRole.ADMIN) {
        logger.warn({ userId: req.userId }, 'Unauthorized admin access attempt');
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      next();
    } catch (err) {
      logger.error({ err, userId: req.userId }, 'Admin middleware error');
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
