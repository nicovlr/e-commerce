import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
