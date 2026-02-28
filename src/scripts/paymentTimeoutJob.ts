import { AppDataSource } from '../config/database';
import { logger } from '../config/logger';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { OrderRepository } from '../repositories/OrderRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { OrderService } from '../services/OrderService';
import { PaymentService } from '../services/PaymentService';

async function main() {
  await AppDataSource.initialize();
  logger.info('Database connected for payment timeout job');

  const orderRepository = new OrderRepository(AppDataSource.getRepository(Order));
  const productRepository = new ProductRepository(AppDataSource.getRepository(Product));
  const paymentService = new PaymentService();
  const orderService = new OrderService(orderRepository, productRepository, undefined, paymentService);

  await orderService.cancelExpiredOrders();

  await AppDataSource.destroy();
  logger.info('Payment timeout job completed');
}

main().catch((err) => {
  logger.error({ err }, 'Payment timeout job failed');
  process.exit(1);
});
