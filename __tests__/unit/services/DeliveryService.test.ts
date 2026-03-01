import { DeliveryService } from '../../../src/services/DeliveryService';
import { DeliveryRepository } from '../../../src/repositories/DeliveryRepository';
import { OrderRepository } from '../../../src/repositories/OrderRepository';
import { Delivery } from '../../../src/models/Delivery';
import { Order } from '../../../src/models/Order';
import { DeliveryStatus, OrderStatus } from '../../../src/types';

const mockDeliveryRepository = {
  findById: jest.fn(),
  findByOrderId: jest.fn(),
  findByTrackingNumber: jest.fn(),
  findAllWithRelations: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<DeliveryRepository>;

const mockOrderRepository = {
  findWithItems: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<OrderRepository>;

describe('DeliveryService', () => {
  let deliveryService: DeliveryService;

  beforeEach(() => {
    jest.clearAllMocks();
    deliveryService = new DeliveryService(mockDeliveryRepository, mockOrderRepository);
  });

  const mockOrder = {
    id: 1,
    userId: 10,
    status: OrderStatus.PROCESSING,
    totalAmount: 99.99,
    items: [],
  } as unknown as Order;

  const mockDelivery = {
    id: 1,
    orderId: 1,
    status: DeliveryStatus.PREPARING,
    trackingNumber: null,
    carrier: 'UPS',
    estimatedDeliveryDate: null,
    shippedAt: null,
    deliveredAt: null,
    notes: null,
  } as unknown as Delivery;

  describe('createDelivery', () => {
    it('should create a delivery for a processing order', async () => {
      mockOrderRepository.findWithItems.mockResolvedValue(mockOrder);
      mockDeliveryRepository.findByOrderId.mockResolvedValue(null);
      mockDeliveryRepository.create.mockResolvedValue(mockDelivery);

      const result = await deliveryService.createDelivery(1, { carrier: 'UPS' });

      expect(mockOrderRepository.findWithItems).toHaveBeenCalledWith(1);
      expect(mockDeliveryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 1, carrier: 'UPS' }),
      );
      expect(result).toEqual(mockDelivery);
    });

    it('should throw if order not found', async () => {
      mockOrderRepository.findWithItems.mockResolvedValue(null);

      await expect(deliveryService.createDelivery(999, {})).rejects.toThrow('Order not found');
    });

    it('should throw if order status is not processing or shipped', async () => {
      mockOrderRepository.findWithItems.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
      } as Order);

      await expect(deliveryService.createDelivery(1, {})).rejects.toThrow(
        "Cannot create delivery for order with status 'pending'",
      );
    });

    it('should throw if delivery already exists', async () => {
      mockOrderRepository.findWithItems.mockResolvedValue(mockOrder);
      mockDeliveryRepository.findByOrderId.mockResolvedValue(mockDelivery);

      await expect(deliveryService.createDelivery(1, {})).rejects.toThrow(
        'Delivery already exists for this order',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      const updated = { ...mockDelivery, status: DeliveryStatus.SHIPPED, shippedAt: new Date() };
      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);
      mockDeliveryRepository.update.mockResolvedValue(updated as Delivery);
      mockOrderRepository.update.mockResolvedValue(null);

      const result = await deliveryService.updateStatus(1, DeliveryStatus.SHIPPED);

      expect(mockDeliveryRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: DeliveryStatus.SHIPPED }),
      );
      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, { status: OrderStatus.SHIPPED });
      expect(result).toEqual(updated);
    });

    it('should throw on invalid transition', async () => {
      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);

      await expect(
        deliveryService.updateStatus(1, DeliveryStatus.DELIVERED),
      ).rejects.toThrow("Invalid delivery status transition from 'preparing' to 'delivered'");
    });

    it('should return null if delivery not found', async () => {
      mockDeliveryRepository.findById.mockResolvedValue(null);

      const result = await deliveryService.updateStatus(999, DeliveryStatus.SHIPPED);
      expect(result).toBeNull();
    });

    it('should set deliveredAt and update order on delivered', async () => {
      const shippedDelivery = { ...mockDelivery, status: DeliveryStatus.OUT_FOR_DELIVERY, orderId: 5 };
      const updatedDelivery = { ...shippedDelivery, status: DeliveryStatus.DELIVERED };
      mockDeliveryRepository.findById.mockResolvedValue(shippedDelivery as Delivery);
      mockDeliveryRepository.update.mockResolvedValue(updatedDelivery as Delivery);
      mockOrderRepository.update.mockResolvedValue(null);

      await deliveryService.updateStatus(1, DeliveryStatus.DELIVERED);

      expect(mockDeliveryRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: DeliveryStatus.DELIVERED,
          deliveredAt: expect.any(Date),
        }),
      );
      expect(mockOrderRepository.update).toHaveBeenCalledWith(5, { status: OrderStatus.DELIVERED });
    });

    it('should accept trackingNumber parameter', async () => {
      mockDeliveryRepository.findById.mockResolvedValue(mockDelivery);
      mockDeliveryRepository.update.mockResolvedValue({ ...mockDelivery, trackingNumber: 'TRACK123' } as Delivery);
      mockOrderRepository.update.mockResolvedValue(null);

      await deliveryService.updateStatus(1, DeliveryStatus.SHIPPED, 'TRACK123');

      expect(mockDeliveryRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ trackingNumber: 'TRACK123' }),
      );
    });
  });

  describe('getDeliveryByOrderId', () => {
    it('should return delivery for order', async () => {
      mockDeliveryRepository.findByOrderId.mockResolvedValue(mockDelivery);

      const result = await deliveryService.getDeliveryByOrderId(1);
      expect(result).toEqual(mockDelivery);
    });

    it('should return null if no delivery', async () => {
      mockDeliveryRepository.findByOrderId.mockResolvedValue(null);

      const result = await deliveryService.getDeliveryByOrderId(999);
      expect(result).toBeNull();
    });
  });

  describe('getAllDeliveries', () => {
    it('should return paginated deliveries', async () => {
      const paginatedResult = {
        data: [mockDelivery],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      mockDeliveryRepository.findAllWithRelations.mockResolvedValue(paginatedResult);

      const result = await deliveryService.getAllDeliveries({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
