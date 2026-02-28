import { Request, Response } from 'express';

import { AnalyticsController } from '../../../src/controllers/AnalyticsController';
import { AnalyticsService } from '../../../src/services/AnalyticsService';

jest.mock('../../../src/config/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const mockAnalyticsService = {
  getSummary: jest.fn(),
  getRevenue: jest.fn(),
  getTopProducts: jest.fn(),
  getOrderMetrics: jest.fn(),
  getCustomerInsights: jest.fn(),
  getStockPerformance: jest.fn(),
} as unknown as jest.Mocked<AnalyticsService>;

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AnalyticsController(mockAnalyticsService as unknown as AnalyticsService);
    res = mockResponse();
  });

  describe('getSummary', () => {
    it('should return summary data', async () => {
      const summary = { totalRevenue: 1000, totalOrders: 10 };
      mockAnalyticsService.getSummary.mockResolvedValue(summary as never);
      const req = { query: { startDate: '2024-01-01' } } as unknown as Request;

      await controller.getSummary(req, res as Response);

      expect(mockAnalyticsService.getSummary).toHaveBeenCalledWith({ startDate: '2024-01-01' });
      expect(res.json).toHaveBeenCalledWith(summary);
    });

    it('should return 500 on error', async () => {
      mockAnalyticsService.getSummary.mockRejectedValue(new Error('DB error'));
      const req = { query: {} } as unknown as Request;

      await controller.getSummary(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch analytics summary' });
    });
  });

  describe('getRevenue', () => {
    it('should return revenue data', async () => {
      const data = [{ date: '2024-01-01', revenue: 500 }];
      mockAnalyticsService.getRevenue.mockResolvedValue(data as never);
      const req = { query: { granularity: 'day' } } as unknown as Request;

      await controller.getRevenue(req, res as Response);

      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 500 on error', async () => {
      mockAnalyticsService.getRevenue.mockRejectedValue(new Error('fail'));
      const req = { query: {} } as unknown as Request;

      await controller.getRevenue(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getTopProducts', () => {
    it('should return top products', async () => {
      const data = [{ name: 'Widget', totalRevenue: 200, totalQuantity: 10 }];
      mockAnalyticsService.getTopProducts.mockResolvedValue(data as never);
      const req = { query: { limit: '5' } } as unknown as Request;

      await controller.getTopProducts(req, res as Response);

      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 500 on error', async () => {
      mockAnalyticsService.getTopProducts.mockRejectedValue(new Error('fail'));
      const req = { query: {} } as unknown as Request;

      await controller.getTopProducts(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getOrders', () => {
    it('should return order metrics', async () => {
      const data = { totalOrders: 50, averageOrderValue: 120 };
      mockAnalyticsService.getOrderMetrics.mockResolvedValue(data as never);
      const req = { query: {} } as unknown as Request;

      await controller.getOrders(req, res as Response);

      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 500 on error', async () => {
      mockAnalyticsService.getOrderMetrics.mockRejectedValue(new Error('fail'));
      const req = { query: {} } as unknown as Request;

      await controller.getOrders(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getCustomers', () => {
    it('should return customer insights', async () => {
      const data = { totalCustomers: 100, newCustomers: 20 };
      mockAnalyticsService.getCustomerInsights.mockResolvedValue(data as never);
      const req = { query: {} } as unknown as Request;

      await controller.getCustomers(req, res as Response);

      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 500 on error', async () => {
      mockAnalyticsService.getCustomerInsights.mockRejectedValue(new Error('fail'));
      const req = { query: {} } as unknown as Request;

      await controller.getCustomers(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getStock', () => {
    it('should return stock performance', async () => {
      const data = { totalProducts: 12, turnoverRate: 0.42 };
      mockAnalyticsService.getStockPerformance.mockResolvedValue(data as never);
      const req = {} as unknown as Request;

      await controller.getStock(req, res as Response);

      expect(mockAnalyticsService.getStockPerformance).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 500 on error', async () => {
      mockAnalyticsService.getStockPerformance.mockRejectedValue(new Error('fail'));
      const req = {} as unknown as Request;

      await controller.getStock(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
