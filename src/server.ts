import 'reflect-metadata';

import { createApp } from './app';
import { config } from './config';
import { AppDataSource } from './config/database';

async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.info('Database connected successfully');

    const app = createApp();

    app.listen(config.port, () => {
      console.info(`Server running on port ${config.port}`);
      console.info(`Environment: ${config.nodeEnv}`);
      console.info(`AI Service URL: ${config.aiService.url}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void bootstrap();
