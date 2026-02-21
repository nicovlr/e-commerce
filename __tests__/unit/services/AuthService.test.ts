import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { AuthService } from '../../../src/services/AuthService';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { User } from '../../../src/models/User';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
} as unknown as jest.Mocked<UserRepository>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockUserRepository);
    (jwt.sign as jest.Mock).mockReturnValue('mock-token');
  });

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@example.com',
    password: '$2a$12$hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
  };

  describe('register', () => {
    it('should register a new user and return token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockResolvedValue({ ...mockUser, password: 'hashed-password' } as User);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.token).toBe('mock-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error with invalid email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('wrong@example.com', 'password123'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
