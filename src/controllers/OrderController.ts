import { Request, Response } from 'express';

import { OrderService } from '../services/OrderService';
import { AuthRequest } from '../types';

interface CreateOrderBody {
  items: Array<{ productId: number; quantity: number }>;
}

interface UpdateStatusBody {
  status: string;
}

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

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.orderService.getOrderById(Number(req.params.id));
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
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

  updateStatus = async (
    req: Request<{ id: string }, unknown, UpdateStatusBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const order = await this.orderService.updateOrderStatus(
        Number(req.params.id),
        req.body.status,
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
