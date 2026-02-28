import { Response } from 'express';

import { OrderService } from '../services/OrderService';
import { AuthRequest } from '../types';

interface CreateOrderBody {
  items: Array<{ productId: number; quantity: number }>;
}

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { items } = req.body as CreateOrderBody;
      const order = await this.orderService.createOrder(req.userId!, items);
      res.status(201).json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      res.status(400).json({ error: message });
    }
  };

  getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.json(orders);
    } catch {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  };

  getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const order = await this.orderService.getOrderById(Number(req.params.id));
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      if (order.userId !== req.userId && req.userRole !== 'admin' && req.userRole !== 'manager') {
        res.status(403).json({ error: 'Not authorized to view this order' });
        return;
      }
      res.json(order);
    } catch {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  };

  getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getUserOrders(req.userId!);
      res.json(orders);
    } catch {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  };

  updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body;

      if (!status || !VALID_STATUSES.includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
        return;
      }

      const order = await this.orderService.updateOrderStatus(
        Number(req.params.id),
        status,
      );
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json(order);
    } catch {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  };
}
