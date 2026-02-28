import Stripe from 'stripe';

import { config } from '../config';
import { logger } from '../config/logger';

export class PaymentService {
  private stripe: Stripe | null = null;

  constructor() {
    if (config.stripe.secretKey) {
      this.stripe = new Stripe(config.stripe.secretKey);
    } else {
      logger.warn('Stripe secret key not set, payment features disabled');
    }
  }

  private ensureStripe(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
    }
    return this.stripe;
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const stripe = this.ensureStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
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
      const stripe = this.ensureStripe();
      await stripe.paymentIntents.cancel(paymentIntentId);
      logger.info({ paymentIntentId }, 'PaymentIntent cancelled');
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to cancel PaymentIntent');
    }
  }

  constructWebhookEvent(body: Buffer, signature: string): Stripe.Event {
    const stripe = this.ensureStripe();
    return stripe.webhooks.constructEvent(
      body,
      signature,
      config.stripe.webhookSecret,
    );
  }
}
