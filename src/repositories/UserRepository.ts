import { ILike, Repository } from 'typeorm';

import { User } from '../models/User';

import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email: ILike(email) });
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
