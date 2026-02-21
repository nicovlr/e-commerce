import { Repository, LessThanOrEqual } from 'typeorm';

import { Product } from '../models/Product';
import { ProductFilter } from '../types';

import { BaseRepository } from './BaseRepository';

export class ProductRepository extends BaseRepository<Product> {
  constructor(repository: Repository<Product>) {
    super(repository);
  }

  async findWithFilters(filters: ProductFilter): Promise<Product[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (filters.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.inStock) {
      queryBuilder.andWhere('product.stock > 0');
    }

    queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });

    return queryBuilder.getMany();
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    return this.repository.find({
      where: {
        stock: LessThanOrEqual(threshold),
        isActive: true,
      },
      relations: ['category'],
    });
  }

  async updateStock(productId: number, quantity: number): Promise<Product | null> {
    const product = await this.findById(productId);
    if (!product) return null;

    product.stock = Math.max(0, product.stock + quantity);
    return this.repository.save(product);
  }
}
