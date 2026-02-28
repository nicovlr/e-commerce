import { AppDataSource } from '../config/database';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { OrderRepository } from '../repositories/OrderRepository';

interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder(userId: number, items: CreateOrderItem[]): Promise<Order> {
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
        status: 'pending',
        items: orderItems.map((oi) => ({
          productId: oi.productId,
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
        })),
      });

      return manager.save(order);
    });
  }

  async getOrderById(orderId: number): Promise<Order | null> {
    return this.orderRepository.findWithItems(orderId);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | null> {
    return this.orderRepository.update(orderId, { status });
  }
}
