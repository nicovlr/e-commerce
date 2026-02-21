import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { config } from '../config';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as Omit<User, 'password'>, token };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as Omit<User, 'password'>, token };
  }

  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  private generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }
}
