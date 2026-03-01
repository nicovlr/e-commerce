import { Response } from 'express';

import { logger } from '../config/logger';
import { DeliveryService } from '../services/DeliveryService';
import { AuthRequest, DeliveryStatus, PaginationQuery } from '../types';

export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orderId, carrier, estimatedDeliveryDate, notes } = req.body;
      const delivery = await this.deliveryService.createDelivery(orderId, {
        carrier,
        estimatedDeliveryDate,
        notes,
      });
      res.status(201).json(delivery);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create delivery';
      logger.error({ err: error }, 'Delivery creation failed');
      res.status(400).json({ error: message });
    }
  };

  getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };
      const result = await this.deliveryService.getAllDeliveries(pagination);
      res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch deliveries');
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  };

  getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const delivery = await this.deliveryService.getDeliveryById(Number(req.params.id));
      if (!delivery) {
        res.status(404).json({ error: 'Delivery not found' });
        return;
      }
      res.json(delivery);
    } catch (error) {
      logger.error({ err: error, deliveryId: req.params.id }, 'Failed to fetch delivery');
      res.status(500).json({ error: 'Failed to fetch delivery' });
    }
  };

  getByOrderId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const delivery = await this.deliveryService.getDeliveryByOrderId(Number(req.params.orderId));
      if (!delivery) {
        res.status(404).json({ error: 'Delivery not found for this order' });
        return;
      }
      res.json(delivery);
    } catch (error) {
      logger.error({ err: error, orderId: req.params.orderId }, 'Failed to fetch delivery by order');
      res.status(500).json({ error: 'Failed to fetch delivery' });
    }
  };

  getMyDeliveries = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };
      const result = await this.deliveryService.getUserDeliveries(req.userId!, pagination);
      res.json(result);
    } catch (error) {
      logger.error({ err: error, userId: req.userId }, 'Failed to fetch user deliveries');
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  };

  track = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const delivery = await this.deliveryService.getDeliveryByTrackingNumber(
        String(req.params.trackingNumber),
      );
      if (!delivery) {
        res.status(404).json({ error: 'Delivery not found' });
        return;
      }
      res.json({
        trackingNumber: delivery.trackingNumber,
        status: delivery.status,
        carrier: delivery.carrier,
        estimatedDeliveryDate: delivery.estimatedDeliveryDate,
        shippedAt: delivery.shippedAt,
        deliveredAt: delivery.deliveredAt,
      });
    } catch (error) {
      logger.error({ err: error }, 'Tracking lookup failed');
      res.status(500).json({ error: 'Failed to track delivery' });
    }
  };

  updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, trackingNumber } = req.body;
      if (!Object.values(DeliveryStatus).includes(status as DeliveryStatus)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${Object.values(DeliveryStatus).join(', ')}`,
        });
        return;
      }

      const delivery = await this.deliveryService.updateStatus(
        Number(req.params.id),
        status as DeliveryStatus,
        trackingNumber,
      );
      if (!delivery) {
        res.status(404).json({ error: 'Delivery not found' });
        return;
      }
      res.json(delivery);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update delivery status';
      if (message.startsWith('Invalid delivery status transition')) {
        res.status(400).json({ error: message });
        return;
      }
      logger.error({ err: error, deliveryId: req.params.id }, 'Failed to update delivery status');
      res.status(500).json({ error: 'Failed to update delivery status' });
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const delivery = await this.deliveryService.updateDelivery(Number(req.params.id), req.body);
      if (!delivery) {
        res.status(404).json({ error: 'Delivery not found' });
        return;
      }
      res.json(delivery);
    } catch (error) {
      logger.error({ err: error, deliveryId: req.params.id }, 'Failed to update delivery');
      res.status(500).json({ error: 'Failed to update delivery' });
    }
  };
}
