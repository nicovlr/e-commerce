import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { config } from '../config';
import { logger } from '../config/logger';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { TokenPayload } from '../types';
import { UserWithoutPassword, stripPassword } from '../utils/stripPassword';

import { PostHogService } from './PostHogService';

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly postHogService?: PostHogService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: UserWithoutPassword; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    logger.info({ userId: user.id }, 'User registered');
    this.postHogService?.capture(String(user.id), 'user_registered', {
      email: user.email,
    });
    this.postHogService?.identify(String(user.id), {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    const token = this.generateToken(user);
    return { user: stripPassword(user), token };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: UserWithoutPassword; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    logger.info({ userId: user.id }, 'User logged in');
    this.postHogService?.capture(String(user.id), 'user_logged_in', {
      email: user.email,
    });
    const token = this.generateToken(user);
    return { user: stripPassword(user), token };
  }

  async getUserById(id: number): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    return stripPassword(user);
  }

  private generateToken(user: User): string {
    const payload: TokenPayload & { role: string } = {
      userId: user.id,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (typeof decoded !== 'object' || decoded === null || typeof (decoded as TokenPayload).userId !== 'number') {
      throw new Error('Invalid token payload');
    }
    return decoded as TokenPayload;
  }
}
