import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { authMiddleware } from '../../../src/middleware/authMiddleware';
import { AuthRequest } from '../../../src/types';

jest.mock('jsonwebtoken');
jest.mock('../../../src/config/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = mockResponse();
    next = jest.fn();
  });

  it('should return 401 when no authorization header', () => {
    authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    req.headers = { authorization: 'Basic some-token' };

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
  });

  it('should return 401 when token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid-token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('should return 401 when token payload is invalid structure', () => {
    req.headers = { authorization: 'Bearer valid-but-bad-payload' };
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 'not-a-user-id' });

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token payload' });
  });

  it('should set userId and call next on valid token', () => {
    req.headers = { authorization: 'Bearer valid-token' };
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 42 });

    authMiddleware(req as AuthRequest, res as Response, next);

    expect(req.userId).toBe(42);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
