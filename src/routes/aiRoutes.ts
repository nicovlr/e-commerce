import { Router } from 'express';

import { AIController } from '../controllers/AIController';
import { authMiddleware, requireStaff } from '../middleware/authMiddleware';

export const createAIRoutes = (controller: AIController): Router => {
  const router = Router();

  /**
   * @swagger
   * /ai/predict:
   *   post:
   *     summary: Get AI demand prediction for a product
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PredictRequest'
   *     responses:
   *       200:
   *         description: Demand prediction for the product
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DemandPrediction'
   *       400:
   *         description: Missing productId in request body
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       503:
   *         description: AI service unavailable
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServiceUnavailableError'
   */
  router.post('/predict', authMiddleware, requireStaff, controller.predict);

  /**
   * @swagger
   * /ai/alerts:
   *   get:
   *     summary: Get AI-generated stock alerts
   *     tags: [AI]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of stock alerts sorted by severity
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/StockAlert'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       503:
   *         description: AI service unavailable
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServiceUnavailableError'
   */
  router.get('/alerts', authMiddleware, requireStaff, controller.getAlerts);

  /**
   * @swagger
   * /ai/health:
   *   get:
   *     summary: Check the health status of the AI service
   *     tags: [AI]
   *     responses:
   *       200:
   *         description: AI service health status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AIHealthResponse'
   */
  router.get('/health', controller.healthCheck);

  return router;
};
