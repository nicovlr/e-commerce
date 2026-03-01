import { Repository } from 'typeorm';

import { Delivery } from '../models/Delivery';
import { PaginatedResult, PaginationQuery } from '../types';

import { BaseRepository } from './BaseRepository';

export class DeliveryRepository extends BaseRepository<Delivery> {
  constructor(repository: Repository<Delivery>) {
    super(repository);
  }

  async findByOrderId(orderId: number): Promise<Delivery | null> {
    return this.repository.findOne({
      where: { orderId },
      relations: ['order'],
    });
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Delivery | null> {
    return this.repository.findOne({
      where: { trackingNumber },
      relations: ['order'],
    });
  }

  async findAllWithRelations(pagination?: PaginationQuery): Promise<PaginatedResult<Delivery>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      relations: ['order', 'order.user'],
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

  async findByUserId(userId: number, pagination?: PaginationQuery): Promise<PaginatedResult<Delivery>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .where('order.userId = :userId', { userId })
      .orderBy('delivery.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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
}
