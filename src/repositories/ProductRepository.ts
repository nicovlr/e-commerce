import { Repository, LessThanOrEqual } from 'typeorm';

import { Product } from '../models/Product';
import { PaginatedResult, PaginationQuery, ProductFilter } from '../types';

import { BaseRepository } from './BaseRepository';

export class ProductRepository extends BaseRepository<Product> {
  constructor(repository: Repository<Product>) {
    super(repository);
  }

  async findAll(): Promise<Product[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['category'],
    });
  }

  async findWithFilters(
    filters: ProductFilter,
    pagination?: PaginationQuery,
  ): Promise<PaginatedResult<Product>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

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

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    // Atomic stock update to prevent race conditions
    await this.repository
      .createQueryBuilder()
      .update(Product)
      .set({ stock: () => 'GREATEST(0, stock + :qty)' })
      .setParameter('qty', quantity)
      .where('id = :id', { id: productId })
      .execute();

    return this.findById(productId);
  }
}
