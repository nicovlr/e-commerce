import { Request, Response, NextFunction } from 'express';

import { AppError, errorMiddleware } from '../../../src/middleware/errorMiddleware';

jest.mock('../../../src/config/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = mockResponse();
    next = jest.fn();
  });

  it('should handle AppError with correct status code and message', () => {
    const err = new AppError(404, 'Product not found');

    errorMiddleware(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });

  it('should handle AppError with 400 status', () => {
    const err = new AppError(400, 'Invalid input');

    errorMiddleware(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid input' });
  });

  it('should handle generic Error with 500 status', () => {
    const err = new Error('Something unexpected');

    errorMiddleware(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should handle error without stack trace', () => {
    const err = new Error('No stack');
    delete err.stack;

    errorMiddleware(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

describe('AppError', () => {
  it('should be an instance of Error', () => {
    const err = new AppError(422, 'Validation failed');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('should have correct properties', () => {
    const err = new AppError(403, 'Forbidden');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
    expect(err.name).toBe('AppError');
  });
});
