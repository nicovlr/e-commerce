import { Request, Response } from 'express';

import { logger } from '../config/logger';
import { OrderService } from '../services/OrderService';
import { UserRepository } from '../repositories/UserRepository';
import { AuthRequest, CreateOrderItem, OrderStatus, PaginationQuery, UserRole } from '../types';

export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userRepository: UserRepository,
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };
      const result = await this.orderService.getAllOrders(pagination);
      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch all orders');
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  };

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { items } = req.body as { items: CreateOrderItem[] };
      const order = await this.orderService.createOrder(req.userId!, items);
      res.status(201).json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      logger.error({ err: error, userId: req.userId }, 'Order creation failed');
      res.status(400).json({ error: message });
    }
  };

  getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const order = await this.orderService.getOrderById(Number(req.params.id));
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // Ownership check: user must own the order or be admin
      const user = await this.userRepository.findById(req.userId!);
      if (order.userId !== req.userId && user?.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(order);
    } catch (err) {
      logger.error({ err, orderId: req.params.id }, 'Failed to fetch order');
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  };

  getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getUserOrders(req.userId!);
      res.json(orders);
    } catch (err) {
      logger.error({ err, userId: req.userId }, 'Failed to fetch user orders');
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  };

  updateStatus = async (
    req: Request<{ id: string }, unknown, { status: string }>,
    res: Response,
  ): Promise<void> => {
    try {
      const { status } = req.body;
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}`,
        });
        return;
      }

      const order = await this.orderService.updateOrderStatus(
        Number(req.params.id),
        status as OrderStatus,
      );
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json(order);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      if (message.startsWith('Invalid status transition')) {
        res.status(400).json({ error: message });
        return;
      }
      logger.error({ err, orderId: req.params.id }, 'Failed to update order status');
      res.status(500).json({ error: 'Failed to update order status' });
    }
  };
}
