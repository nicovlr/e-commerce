import { Repository } from 'typeorm';

import { Order } from '../models/Order';

import { BaseRepository } from './BaseRepository';

export class OrderRepository extends BaseRepository<Order> {
  constructor(repository: Repository<Order>) {
    super(repository);
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.repository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
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
}
