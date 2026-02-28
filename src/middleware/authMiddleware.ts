import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

import { config } from '../config';
import { logger } from '../config/logger';
import { AuthRequest, TokenPayload } from '../types';

function isTokenPayload(decoded: unknown): decoded is TokenPayload {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    typeof (decoded as TokenPayload).userId === 'number'
  );
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (!isTokenPayload(decoded)) {
      logger.warn('Invalid token payload structure');
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }
    req.userId = decoded.userId;
    req.userRole = (decoded as { role?: string }).role as AuthRequest['userRole'];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const requireStaff = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'manager' && req.userRole !== 'admin') {
    res.status(403).json({ error: 'Staff access required' });
    return;
  }
  next();
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
