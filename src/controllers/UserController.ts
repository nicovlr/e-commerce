import { Response } from 'express';

import { logger } from '../config/logger';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../types';

const VALID_ROLES = ['customer', 'manager', 'admin'] as const;

export class UserController {
  constructor(private readonly userService: UserService) {}

  getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch users');
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      res.status(500).json({ error: message });
    }
  };

  updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { role } = req.body;

      if (!role || !VALID_ROLES.includes(role)) {
        res.status(400).json({
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
        });
        return;
      }

      // Only admins can assign the admin role
      if (role === 'admin' && req.userRole !== 'admin') {
        res.status(403).json({ error: 'Only admins can promote users to admin' });
        return;
      }

      const targetUserId = Number(req.params.id);
      const oldUser = await this.userService.getUserById(targetUserId);
      const oldRole = oldUser?.role;

      const user = await this.userService.updateUserRole(targetUserId, role);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      logger.info(
        { adminId: req.userId, targetUserId, oldRole, newRole: role },
        'User role updated',
      );

      res.json(user);
    } catch (error) {
      logger.error({ err: error, targetUserId: req.params.id }, 'Failed to update user role');
      const message = error instanceof Error ? error.message : 'Failed to update user role';
      res.status(500).json({ error: message });
    }
  };
}
