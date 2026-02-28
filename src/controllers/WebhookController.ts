import { Request, Response } from 'express';

import { logger } from '../config/logger';
import { OrderService } from '../services/OrderService';
import { PaymentService } from '../services/PaymentService';

export class WebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService,
  ) {}

  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    try {
      const event = this.paymentService.constructWebhookEvent(
        req.body as Buffer,
        signature,
      );

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          await this.orderService.handlePaymentSuccess(paymentIntent.id);
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          await this.orderService.handlePaymentFailure(paymentIntent.id);
          break;
        }
        default:
          logger.info({ eventType: event.type }, 'Unhandled Stripe event');
      }

      res.json({ received: true });
    } catch (error) {
      logger.error({ err: error }, 'Webhook signature verification failed');
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  };
}
