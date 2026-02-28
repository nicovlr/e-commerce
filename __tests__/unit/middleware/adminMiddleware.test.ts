import { Response, NextFunction } from 'express';

import { createAdminMiddleware } from '../../../src/middleware/adminMiddleware';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { User } from '../../../src/models/User';
import { AuthRequest, UserRole } from '../../../src/types';

jest.mock('../../../src/config/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const mockUserRepository = {
  findById: jest.fn(),
} as unknown as jest.Mocked<UserRepository>;

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('adminMiddleware', () => {
  let middleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = createAdminMiddleware(mockUserRepository as unknown as UserRepository);
    req = {};
    res = mockResponse();
    next = jest.fn();
  });

  it('should return 401 when userId is not set', async () => {
    await middleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when user is not found', async () => {
    req.userId = 999;
    mockUserRepository.findById.mockResolvedValue(null);

    await middleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
  });

  it('should return 403 when user is not admin', async () => {
    req.userId = 1;
    mockUserRepository.findById.mockResolvedValue({
      id: 1,
      role: UserRole.CUSTOMER,
    } as User);

    await middleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
  });

  it('should call next when user is admin', async () => {
    req.userId = 1;
    mockUserRepository.findById.mockResolvedValue({
      id: 1,
      role: UserRole.ADMIN,
    } as User);

    await middleware(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 500 on repository error', async () => {
    req.userId = 1;
    mockUserRepository.findById.mockRejectedValue(new Error('DB error'));

    await middleware(req as AuthRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
