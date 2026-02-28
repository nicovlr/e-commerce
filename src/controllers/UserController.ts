import { Response } from 'express';

import { UserService } from '../services/UserService';
import { AuthRequest } from '../types';

const VALID_ROLES = ['customer', 'manager', 'admin'] as const;

export class UserController {
  constructor(private readonly userService: UserService) {}

  getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch {
      res.status(500).json({ error: 'Failed to fetch users' });
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

      const user = await this.userService.updateUserRole(
        Number(req.params.id),
        role,
      );
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  };
}
