import { AppDataSource } from '../config/database';
import { logger } from '../config/logger';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import {
  CreateOrderItem,
  OrderStatus,
  PaginatedResult,
  PaginationQuery,
  PaymentStatus,
  ShippingAddress,
} from '../types';

import { PaymentService } from './PaymentService';
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
    private readonly paymentService?: PaymentService,
  ) {}

  async createOrder(
    userId: number,
    items: CreateOrderItem[],
    shippingAddress?: ShippingAddress,
    stripePaymentIntentId?: string,
  ): Promise<Order> {
    return AppDataSource.transaction(async (manager) => {
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

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

        product.stock -= item.quantity;
        await manager.save(product);
      }

      const order = manager.create(Order, {
        userId,
        totalAmount,
        status: OrderStatus.PENDING,
        items: orderItems.map((oi) => ({
          productId: oi.productId,
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
        })),
        shippingAddress: shippingAddress || null,
        stripePaymentIntentId: stripePaymentIntentId || null,
        paymentStatus: PaymentStatus.UNPAID,
      });

      const savedOrder = await manager.save(order);

      logger.info({ orderId: savedOrder.id, userId, itemCount: items.length }, 'Order created');
      this.postHogService?.capture(String(userId), 'order_created', {
        orderId: savedOrder.id,
        totalAmount: totalAmount,
        itemCount: items.length,
      });
      return savedOrder;
    });
  }

  async checkout(
    userId: number,
    items: CreateOrderItem[],
    shippingAddress: ShippingAddress,
  ): Promise<{ orderId: number; clientSecret: string }> {
    if (!this.paymentService) {
      throw new Error('Payment service not configured');
    }

    // Validate products and calculate total first
    let totalAmount = 0;
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
      totalAmount += Number(product.price) * item.quantity;
    }

    // Create PaymentIntent
    const { clientSecret, paymentIntentId } = await this.paymentService.createPaymentIntent(
      totalAmount,
      'usd',
      { userId: String(userId) },
    );

    // Create order with payment info
    const order = await this.createOrder(userId, items, shippingAddress, paymentIntentId);

    logger.info({ orderId: order.id, paymentIntentId }, 'Checkout initiated');
    return { orderId: order.id, clientSecret };
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    const order = await this.orderRepository.findByPaymentIntentId(paymentIntentId);
    if (!order) {
      logger.warn({ paymentIntentId }, 'No order found for PaymentIntent');
      return;
    }

    await this.orderRepository.update(order.id, {
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.PROCESSING,
    });

    logger.info({ orderId: order.id, paymentIntentId }, 'Payment succeeded, order processing');
  }

  async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    const order = await this.orderRepository.findByPaymentIntentId(paymentIntentId);
    if (!order) {
      logger.warn({ paymentIntentId }, 'No order found for PaymentIntent');
      return;
    }

    // Restock products
    if (order.items?.length) {
      await AppDataSource.transaction(async (manager) => {
        for (const item of order.items) {
          await manager
            .createQueryBuilder()
            .update('products')
            .set({ stock: () => 'stock + :qty' })
            .setParameter('qty', item.quantity)
            .where('id = :id', { id: item.productId })
            .execute();
        }
      });
    }

    await this.orderRepository.update(order.id, {
      paymentStatus: PaymentStatus.FAILED,
    });

    logger.info({ orderId: order.id, paymentIntentId }, 'Payment failed, stock restored');
  }

  async cancelExpiredOrders(): Promise<void> {
    if (!this.paymentService) {
      return;
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const expiredOrders = await this.orderRepository['repository']
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.UNPAID })
      .andWhere('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.CANCELLED })
      .andWhere('order.createdAt < :cutoff', { cutoff: thirtyMinutesAgo })
      .andWhere('order.stripePaymentIntentId IS NOT NULL')
      .getMany();

    for (const order of expiredOrders) {
      try {
        if (order.stripePaymentIntentId) {
          await this.paymentService.cancelPaymentIntent(order.stripePaymentIntentId);
        }

        // Restock
        if (order.items?.length) {
          await AppDataSource.transaction(async (manager) => {
            for (const item of order.items) {
              await manager
                .createQueryBuilder()
                .update('products')
                .set({ stock: () => 'stock + :qty' })
                .setParameter('qty', item.quantity)
                .where('id = :id', { id: item.productId })
                .execute();
            }
          });
        }

        await this.orderRepository.update(order.id, {
          status: OrderStatus.CANCELLED,
        });

        logger.info({ orderId: order.id }, 'Expired unpaid order cancelled');
      } catch (error) {
        logger.error({ error, orderId: order.id }, 'Failed to cancel expired order');
      }
    }

    if (expiredOrders.length > 0) {
      logger.info({ count: expiredOrders.length }, 'Expired orders cleanup completed');
    }
  }

  async getAllOrders(pagination?: PaginationQuery): Promise<PaginatedResult<Order>> {
    return this.orderRepository.findAllWithRelations(pagination);
  }

  async getOrderById(orderId: number): Promise<Order | null> {
    return this.orderRepository.findWithItems(orderId);
  }

  async getUserOrders(userId: number, pagination?: PaginationQuery): Promise<PaginatedResult<Order>> {
    return this.orderRepository.findByUserId(userId, pagination);
  }

  async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order | null> {
    return AppDataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['items', 'items.product', 'user'],
        lock: { mode: 'pessimistic_write' },
      });

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
        for (const item of order.items) {
          await manager
            .createQueryBuilder()
            .update('products')
            .set({ stock: () => 'stock + :qty' })
            .setParameter('qty', item.quantity)
            .where('id = :id', { id: item.productId })
            .execute();
        }
      }

      order.status = newStatus;
      await manager.save(order);

      if (newStatus === OrderStatus.CANCELLED) {
        logger.info({ orderId, status: newStatus, restocked: true }, 'Order cancelled, stock restored');
      } else {
        logger.info({ orderId, status: newStatus }, 'Order status updated');
      }

      return order;
    });
  }
}
