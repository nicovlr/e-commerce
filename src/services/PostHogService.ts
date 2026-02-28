import { PostHog } from 'posthog-node';

import { config } from '../config';
import { logger } from '../config/logger';

export class PostHogService {
  private client: PostHog | null = null;

  constructor() {
    if (config.posthog.apiKey) {
      this.client = new PostHog(config.posthog.apiKey, {
        host: config.posthog.host,
        flushAt: 20,
        flushInterval: 10000,
      });
      logger.info('PostHog client initialized');
    } else {
      logger.warn('PostHog API key not set, events will not be tracked');
    }
  }

  capture(distinctId: string, event: string, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    try {
      this.client.capture({ distinctId, event, properties });
    } catch (err) {
      logger.error({ err, event }, 'Failed to capture PostHog event');
    }
  }

  identify(distinctId: string, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    try {
      this.client.identify({ distinctId, properties });
    } catch (err) {
      logger.error({ err }, 'Failed to identify PostHog user');
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
    }
  }
}
