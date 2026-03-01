import { logger } from '../config/logger';
import { Delivery } from '../models/Delivery';
import { DeliveryRepository } from '../repositories/DeliveryRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { DeliveryStatus, OrderStatus, PaginatedResult, PaginationQuery } from '../types';

const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.PREPARING]: [DeliveryStatus.SHIPPED, DeliveryStatus.FAILED],
  [DeliveryStatus.SHIPPED]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.FAILED],
  [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.FAILED],
  [DeliveryStatus.OUT_FOR_DELIVERY]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.FAILED]: [DeliveryStatus.PREPARING],
};

export class DeliveryService {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createDelivery(
    orderId: number,
    data: { carrier?: string; estimatedDeliveryDate?: string; notes?: string },
  ): Promise<Delivery> {
    const order = await this.orderRepository.findWithItems(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PROCESSING && order.status !== OrderStatus.SHIPPED) {
      throw new Error(`Cannot create delivery for order with status '${order.status}'`);
    }

    const existing = await this.deliveryRepository.findByOrderId(orderId);
    if (existing) {
      throw new Error('Delivery already exists for this order');
    }

    const delivery = await this.deliveryRepository.create({
      orderId,
      status: DeliveryStatus.PREPARING,
      carrier: data.carrier || null,
      estimatedDeliveryDate: data.estimatedDeliveryDate
        ? new Date(data.estimatedDeliveryDate)
        : null,
      notes: data.notes || null,
    });

    logger.info({ deliveryId: delivery.id, orderId }, 'Delivery created');
    return delivery;
  }

  async getDeliveryById(id: number): Promise<Delivery | null> {
    return this.deliveryRepository.findById(id);
  }

  async getDeliveryByOrderId(orderId: number): Promise<Delivery | null> {
    return this.deliveryRepository.findByOrderId(orderId);
  }

  async getDeliveryByTrackingNumber(trackingNumber: string): Promise<Delivery | null> {
    return this.deliveryRepository.findByTrackingNumber(trackingNumber);
  }

  async getAllDeliveries(pagination?: PaginationQuery): Promise<PaginatedResult<Delivery>> {
    return this.deliveryRepository.findAllWithRelations(pagination);
  }

  async getUserDeliveries(userId: number, pagination?: PaginationQuery): Promise<PaginatedResult<Delivery>> {
    return this.deliveryRepository.findByUserId(userId, pagination);
  }

  async updateStatus(
    deliveryId: number,
    newStatus: DeliveryStatus,
    trackingNumber?: string,
  ): Promise<Delivery | null> {
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      return null;
    }

    const allowed = VALID_TRANSITIONS[delivery.status as DeliveryStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Invalid delivery status transition from '${delivery.status}' to '${newStatus}'`,
      );
    }

    const updateData: Partial<Delivery> = { status: newStatus };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (newStatus === DeliveryStatus.SHIPPED) {
      updateData.shippedAt = new Date();
      // Also update order status to shipped
      await this.orderRepository.update(delivery.orderId, { status: OrderStatus.SHIPPED });
    }

    if (newStatus === DeliveryStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
      // Also update order status to delivered
      await this.orderRepository.update(delivery.orderId, { status: OrderStatus.DELIVERED });
    }

    const updated = await this.deliveryRepository.update(deliveryId, updateData);

    logger.info(
      { deliveryId, orderId: delivery.orderId, oldStatus: delivery.status, newStatus },
      'Delivery status updated',
    );

    return updated;
  }

  async updateDelivery(
    deliveryId: number,
    data: { carrier?: string; estimatedDeliveryDate?: string; notes?: string; trackingNumber?: string },
  ): Promise<Delivery | null> {
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      return null;
    }

    const updateData: Partial<Delivery> = {};
    if (data.carrier !== undefined) updateData.carrier = data.carrier;
    if (data.trackingNumber !== undefined) updateData.trackingNumber = data.trackingNumber;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.estimatedDeliveryDate !== undefined) {
      updateData.estimatedDeliveryDate = new Date(data.estimatedDeliveryDate);
    }

    return this.deliveryRepository.update(deliveryId, updateData);
  }
}
