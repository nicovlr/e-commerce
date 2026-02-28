import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { AppDataSource } from './config/database';
import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import { AIController } from './controllers/AIController';
import { AnalyticsController } from './controllers/AnalyticsController';
import { AuthController } from './controllers/AuthController';
import { CategoryController } from './controllers/CategoryController';
import { OrderController } from './controllers/OrderController';
import { ProductController } from './controllers/ProductController';
import { createAdminMiddleware } from './middleware/adminMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { Category } from './models/Category';
import { Order } from './models/Order';
import { Product } from './models/Product';
import { User } from './models/User';
import { AnalyticsRepository } from './repositories/AnalyticsRepository';
import { CategoryRepository } from './repositories/CategoryRepository';
import { OrderRepository } from './repositories/OrderRepository';
import { ProductRepository } from './repositories/ProductRepository';
import { UserRepository } from './repositories/UserRepository';
import { createApiRoutes } from './routes';
import { createSitemapRoutes } from './routes/sitemapRoutes';
import { AIService } from './services/AIService';
import { AnalyticsService } from './services/AnalyticsService';
import { AuthService } from './services/AuthService';
import { CategoryService } from './services/CategoryService';
import { OrderService } from './services/OrderService';
import { PostHogService } from './services/PostHogService';
import { ProductService } from './services/ProductService';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
    }),
  );

  // Global rate limiting for all API routes
  const globalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });

  // Stricter rate limiting on auth routes
  const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: Math.min(config.rateLimit.max, 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });

  app.use(express.json({ limit: '10kb' }));

  // Structured HTTP logging
  app.use(pinoHttp({ logger }));

  // Health check with DB connectivity
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      const dbConnected = AppDataSource.isInitialized;
      if (dbConnected) {
        await AppDataSource.query('SELECT 1');
      }
      res.json({
        status: dbConnected ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbConnected ? 'connected' : 'disconnected',
      });
    } catch {
      res.status(503).json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        database: 'error',
      });
    }
  });

  // Swagger API documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Dependency Injection - Repositories
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const productRepository = new ProductRepository(AppDataSource.getRepository(Product));
  const orderRepository = new OrderRepository(AppDataSource.getRepository(Order));
  const categoryRepository = new CategoryRepository(AppDataSource.getRepository(Category));
  const analyticsRepository = new AnalyticsRepository(AppDataSource);

  // Dependency Injection - Services
  const postHogService = new PostHogService();
  const authService = new AuthService(userRepository, postHogService);
  const productService = new ProductService(productRepository);
  const orderService = new OrderService(orderRepository, productRepository, postHogService);
  const categoryService = new CategoryService(categoryRepository);
  const aiService = new AIService();
  const analyticsService = new AnalyticsService(analyticsRepository);

  // Dependency Injection - Controllers
  const authController = new AuthController(authService);
  const productController = new ProductController(productService);
  const orderController = new OrderController(orderService, userRepository);
  const categoryController = new CategoryController(categoryService);
  const aiController = new AIController(aiService);
  const analyticsController = new AnalyticsController(analyticsService);

  // Admin middleware
  const adminMiddleware = createAdminMiddleware(userRepository);

  // Apply rate limiting
  app.use('/api', globalLimiter);
  app.use('/api/auth', authLimiter);

  // Sitemap route (before API routes so it's accessible at /sitemap.xml)
  app.use(createSitemapRoutes(productRepository));

  // Routes
  app.use(
    '/api',
    createApiRoutes(
      productController,
      authController,
      orderController,
      categoryController,
      aiController,
      analyticsController,
      adminMiddleware,
    ),
  );

  // Error handling
  app.use(errorMiddleware);

  return app;
}
