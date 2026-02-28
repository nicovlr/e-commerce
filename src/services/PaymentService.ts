import Stripe from 'stripe';

import { config } from '../config';
import { logger } from '../config/logger';

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey);
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });

    logger.info({ paymentIntentId: paymentIntent.id }, 'PaymentIntent created');
    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      logger.info({ paymentIntentId }, 'PaymentIntent cancelled');
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to cancel PaymentIntent');
    }
  }

  constructWebhookEvent(body: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret,
    );
  }
}
