import { Repository } from 'typeorm';

import { Category } from '../models/Category';

import { BaseRepository } from './BaseRepository';

export class CategoryRepository extends BaseRepository<Category> {
  constructor(repository: Repository<Category>) {
    super(repository);
  }

  async findByName(name: string): Promise<Category | null> {
    return this.repository.findOneBy({ name });
  }

  async findWithProducts(categoryId: number): Promise<Category | null> {
    return this.repository.findOne({
      where: { id: categoryId },
      relations: ['products'],
    });
  }
}
