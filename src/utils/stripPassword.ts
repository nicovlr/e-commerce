import { User } from '../models/User';

export type UserWithoutPassword = Omit<User, 'password'>;

export function stripPassword(user: User): UserWithoutPassword {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest as UserWithoutPassword;
}
