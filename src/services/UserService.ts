import { UserRepository } from '../repositories/UserRepository';
import { UserWithoutPassword, stripPassword } from '../utils/stripPassword';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    const users = await this.userRepository.findAll();
    return users.map(stripPassword);
  }

  async updateUserRole(
    userId: number,
    role: 'customer' | 'manager' | 'admin',
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.update(userId, { role });
    if (!user) return null;
    return stripPassword(user);
  }
}
