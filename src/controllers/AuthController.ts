import { Request, Response } from 'express';

import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const status = message === 'Email already registered' ? 409 : 500;
      res.status(status).json({ error: message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const status = message === 'Invalid credentials' ? 401 : 500;
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
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  };
}
