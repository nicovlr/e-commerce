import { Request, Response } from 'express';

import { logger } from '../config/logger';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.analyticsService.getSummary(req.query as Record<string, unknown>);
      res.json(summary);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch analytics summary');
      res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
  };

  getRevenue = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.analyticsService.getRevenue(req.query as Record<string, unknown>);
      res.json(data);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch revenue data');
      res.status(500).json({ error: 'Failed to fetch revenue data' });
    }
  };

  getTopProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.analyticsService.getTopProducts(
        req.query as Record<string, unknown>,
      );
      res.json(data);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch top products');
      res.status(500).json({ error: 'Failed to fetch top products' });
    }
  };

  getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.analyticsService.getOrderMetrics(
        req.query as Record<string, unknown>,
      );
      res.json(data);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch order metrics');
      res.status(500).json({ error: 'Failed to fetch order metrics' });
    }
  };

  getCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.analyticsService.getCustomerInsights(
        req.query as Record<string, unknown>,
      );
      res.json(data);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch customer insights');
      res.status(500).json({ error: 'Failed to fetch customer insights' });
    }
  };

  getStock = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.analyticsService.getStockPerformance();
      res.json(data);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch stock performance');
      res.status(500).json({ error: 'Failed to fetch stock performance' });
    }
  };
}
