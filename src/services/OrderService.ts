import { Order } from '../models/Order';
import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';

interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async createOrder(userId: number, items: CreateOrderItem[]): Promise<Order> {
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
      status: 'pending',
      items: orderItems,
    });

    // Update stock
    for (const item of items) {
      await this.productRepository.updateStock(item.productId, -item.quantity);
    }

    return order;
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
