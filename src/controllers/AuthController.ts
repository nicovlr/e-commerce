import { Request, Response } from 'express';

import { logger } from '../config/logger';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../types';

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request<unknown, unknown, RegisterBody>, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const status = message === 'Email already registered' ? 409 : 500;
      if (status === 500) logger.error({ err: error }, 'Registration failed');
      res.status(status).json({ error: message });
    }
  };

  login = async (req: Request<unknown, unknown, LoginBody>, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const status = message === 'Invalid credentials' ? 401 : 500;
      if (status === 500) logger.error({ err: error }, 'Login failed');
      res.status(status).json({ error: message });
    }
  };

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await this.authService.getUserById(req.userId!);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (err) {
      logger.error({ err, userId: req.userId }, 'Failed to fetch profile');
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  };
}
