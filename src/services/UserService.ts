import { UserRepository } from '../repositories/UserRepository';
import { UserRole } from '../types';
import { UserWithoutPassword, stripPassword } from '../utils/stripPassword';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    const users = await this.userRepository.findAll();
    return users.map(stripPassword);
  }

  async updateUserRole(
    userId: number,
    role: UserRole,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.update(userId, { role });
    if (!user) return null;
    return stripPassword(user);
  }
}
