import { Router } from 'express';

import { DeliveryController } from '../controllers/DeliveryController';
import { authMiddleware, requireStaff } from '../middleware/authMiddleware';
import { validateId, validatePagination } from '../middleware/validationMiddleware';

export const createDeliveryRoutes = (controller: DeliveryController): Router => {
  const router = Router();

  /**
   * @swagger
   * /deliveries:
   *   get:
   *     summary: Get all deliveries (staff only)
   *     tags: [Deliveries]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Paginated list of deliveries
   */
  router.get('/', authMiddleware, requireStaff, validatePagination, controller.getAll);

  /**
   * @swagger
   * /deliveries/my-deliveries:
   *   get:
   *     summary: Get deliveries for the authenticated user
   *     tags: [Deliveries]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User's deliveries
   */
  router.get('/my-deliveries', authMiddleware, validatePagination, controller.getMyDeliveries);

  /**
   * @swagger
   * /deliveries/track/{trackingNumber}:
   *   get:
   *     summary: Track a delivery by tracking number
   *     tags: [Deliveries]
   *     parameters:
   *       - in: path
   *         name: trackingNumber
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Delivery tracking info
   *       404:
   *         description: Delivery not found
   */
  router.get('/track/:trackingNumber', authMiddleware, controller.track);

  /**
   * @swagger
   * /deliveries/order/{orderId}:
   *   get:
   *     summary: Get delivery by order ID
   *     tags: [Deliveries]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Delivery details
   *       404:
   *         description: Delivery not found
   */
  router.get('/order/:orderId', authMiddleware, controller.getByOrderId);

  /**
   * @swagger
   * /deliveries/{id}:
   *   get:
   *     summary: Get delivery by ID
   *     tags: [Deliveries]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Delivery details
   *       404:
   *         description: Delivery not found
   */
  router.get('/:id', authMiddleware, validateId, controller.getById);

  /**
   * @swagger
   * /deliveries:
   *   post:
   *     summary: Create a delivery for an order (staff only)
   *     tags: [Deliveries]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - orderId
   *             properties:
   *               orderId:
   *                 type: integer
   *               carrier:
   *                 type: string
   *               estimatedDeliveryDate:
   *                 type: string
   *                 format: date
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Delivery created
   *       400:
   *         description: Invalid request
   */
  router.post('/', authMiddleware, requireStaff, controller.create);

  /**
   * @swagger
   * /deliveries/{id}:
   *   patch:
   *     summary: Update delivery details (staff only)
   *     tags: [Deliveries]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               carrier:
   *                 type: string
   *               trackingNumber:
   *                 type: string
   *               estimatedDeliveryDate:
   *                 type: string
   *                 format: date
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Delivery updated
   *       404:
   *         description: Delivery not found
   */
  router.patch('/:id', authMiddleware, requireStaff, validateId, controller.update);

  /**
   * @swagger
   * /deliveries/{id}/status:
   *   patch:
   *     summary: Update delivery status (staff only)
   *     tags: [Deliveries]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [preparing, shipped, in_transit, out_for_delivery, delivered, failed]
   *               trackingNumber:
   *                 type: string
   *     responses:
   *       200:
   *         description: Delivery status updated
   *       400:
   *         description: Invalid status transition
   *       404:
   *         description: Delivery not found
   */
  router.patch('/:id/status', authMiddleware, requireStaff, validateId, controller.updateStatus);

  return router;
};
