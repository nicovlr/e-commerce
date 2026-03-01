import { Repository } from 'typeorm';

import { Order } from '../models/Order';
import { PaginatedResult, PaginationQuery } from '../types';

import { BaseRepository } from './BaseRepository';

export class OrderRepository extends BaseRepository<Order> {
  constructor(repository: Repository<Order>) {
    super(repository);
  }

  async findByUserId(userId: number, pagination?: PaginationQuery): Promise<PaginatedResult<Order>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

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

  async findAllWithRelations(pagination?: PaginationQuery): Promise<PaginatedResult<Order>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

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

  async findWithItems(orderId: number): Promise<Order | null> {
    return this.repository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });
  }

  async findAllWithItems(): Promise<Order[]> {
    return this.repository.find({
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPaymentIntentId(stripePaymentIntentId: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { stripePaymentIntentId },
      relations: ['items', 'items.product'],
    });
  }
}
