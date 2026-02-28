import { AppDataSource } from '../config/database';
import { logger } from '../config/logger';
import { Order } from '../models/Order';
import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateOrderItem, OrderStatus, PaginatedResult, PaginationQuery } from '../types';

import { PostHogService } from './PostHogService';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly postHogService?: PostHogService,
  ) {}

  async createOrder(userId: number, items: CreateOrderItem[]): Promise<Order> {
    return AppDataSource.transaction(async (manager) => {
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        totalAmount += Number(product.price) * item.quantity;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }

      const order = await this.orderRepository.create({
        userId,
        totalAmount,
        status: OrderStatus.PENDING,
        items: orderItems,
      });

      // Atomic stock update within transaction
      for (const item of items) {
        await manager
          .createQueryBuilder()
          .update('products')
          .set({ stock: () => `stock - ${item.quantity}` })
          .where('id = :id AND stock >= :qty', { id: item.productId, qty: item.quantity })
          .execute();
      }

      logger.info({ orderId: order.id, userId, itemCount: items.length }, 'Order created');
      this.postHogService?.capture(String(userId), 'order_created', {
        orderId: order.id,
        totalAmount: totalAmount,
        itemCount: items.length,
      });
      return order;
    });
  }

  async getAllOrders(pagination?: PaginationQuery): Promise<PaginatedResult<Order>> {
    return this.orderRepository.findAllWithRelations(pagination);
  }

  async getOrderById(orderId: number): Promise<Order | null> {
    return this.orderRepository.findWithItems(orderId);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order | null> {
    const order = await this.orderRepository.findWithItems(orderId);
    if (!order) {
      return null;
    }

    const allowed = VALID_TRANSITIONS[order.status as OrderStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from '${order.status}' to '${newStatus}'`,
      );
    }

    // Restock items when cancelling
    if (newStatus === OrderStatus.CANCELLED && order.items?.length) {
      await AppDataSource.transaction(async (manager) => {
        for (const item of order.items) {
          await manager
            .createQueryBuilder()
            .update('products')
            .set({ stock: () => `stock + ${item.quantity}` })
            .where('id = :id', { id: item.productId })
            .execute();
        }
        await manager
          .createQueryBuilder()
          .update('orders')
          .set({ status: newStatus })
          .where('id = :id', { id: orderId })
          .execute();
      });
      logger.info({ orderId, status: newStatus, restocked: true }, 'Order cancelled, stock restored');
      return this.orderRepository.findWithItems(orderId);
    }

    logger.info({ orderId, status: newStatus }, 'Order status updated');
    return this.orderRepository.update(orderId, { status: newStatus });
  }
}
