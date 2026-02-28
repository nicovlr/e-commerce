import { Router } from 'express';

import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

export const createAnalyticsRoutes = (
  controller: AnalyticsController,
  adminMiddleware: ReturnType<typeof import('../middleware/adminMiddleware').createAdminMiddleware>,
): Router => {
  const router = Router();

  /**
   * @swagger
   * /analytics/summary:
   *   get:
   *     summary: Get a full analytics summary dashboard
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: granularity
   *         schema:
   *           type: string
   *           enum: [day, week, month]
   *         description: Time granularity for revenue data
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Limit for top items lists
   *     responses:
   *       200:
   *         description: Analytics summary data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AnalyticsSummary'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/summary', authMiddleware, adminMiddleware, controller.getSummary);

  /**
   * @swagger
   * /analytics/revenue:
   *   get:
   *     summary: Get revenue data over time
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: granularity
   *         schema:
   *           type: string
   *           enum: [day, week, month]
   *         description: Time granularity for revenue data
   *     responses:
   *       200:
   *         description: Revenue data points
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/RevenueDataPoint'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/revenue', authMiddleware, adminMiddleware, controller.getRevenue);

  /**
   * @swagger
   * /analytics/top-products:
   *   get:
   *     summary: Get top-selling products
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of top products to return
   *     responses:
   *       200:
   *         description: List of top products by sales
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/TopProduct'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/top-products', authMiddleware, adminMiddleware, controller.getTopProducts);

  /**
   * @swagger
   * /analytics/orders:
   *   get:
   *     summary: Get order metrics and status breakdown
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the analytics period (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Order metrics data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/OrderMetrics'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/orders', authMiddleware, adminMiddleware, controller.getOrders);

  /**
   * @swagger
   * /analytics/customers:
   *   get:
   *     summary: Get customer insights and top buyers
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the analytics period (YYYY-MM-DD)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of top customers to return
   *     responses:
   *       200:
   *         description: Customer insights data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CustomerInsights'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/customers', authMiddleware, adminMiddleware, controller.getCustomers);

  /**
   * @swagger
   * /analytics/stock:
   *   get:
   *     summary: Get stock performance and low-stock report
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Stock performance data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StockPerformance'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/stock', authMiddleware, adminMiddleware, controller.getStock);

  return router;
};
