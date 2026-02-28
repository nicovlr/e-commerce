import 'reflect-metadata';

import { createApp } from './app';
import { config } from './config';
import { AppDataSource } from './config/database';
import { logger } from './config/logger';

async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');

    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
    });

    // Graceful shutdown
    const shutdown = (signal: string): void => {
      logger.info({ signal }, 'Shutdown signal received, closing gracefully');
      server.close(() => {
        if (AppDataSource.isInitialized) {
          AppDataSource.destroy()
            .then(() => {
              logger.info('Database connection closed');
              process.exit(0);
            })
            .catch((err) => {
              logger.error({ err }, 'Error during database shutdown');
              process.exit(1);
            });
        } else {
          process.exit(0);
        }
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

void bootstrap();
