import { Request, Response } from 'express';

import { logger } from '../config/logger';
import { AIService } from '../services/AIService';

interface PredictBody {
  productId?: number;
}

export class AIController {
  constructor(private readonly aiService: AIService) {}

  predict = async (req: Request<unknown, unknown, PredictBody>, res: Response): Promise<void> => {
    try {
      const { productId } = req.body;
      if (!productId) {
        res.status(400).json({ error: 'productId is required' });
        return;
      }
      const prediction = await this.aiService.getPrediction(Number(productId));
      res.json(prediction);
    } catch (error) {
      logger.error({ err: error }, 'AI prediction request failed');
      res.status(503).json({
        error: 'AI service unavailable',
        message: 'The demand prediction service is currently offline',
      });
    }
  };

  getAlerts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const alerts = await this.aiService.getStockAlerts();
      res.json(alerts);
    } catch (error) {
      logger.error({ err: error }, 'AI stock alerts request failed');
      res.status(503).json({
        error: 'AI service unavailable',
        message: 'The stock alert service is currently offline',
      });
    }
  };

  healthCheck = async (_req: Request, res: Response): Promise<void> => {
    const isHealthy = await this.aiService.healthCheck();
    res.json({
      aiService: isHealthy ? 'healthy' : 'unavailable',
    });
  };
}
