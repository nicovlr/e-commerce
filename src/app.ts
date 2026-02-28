import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';

import { AppDataSource } from './config/database';
import { AIController } from './controllers/AIController';
import { AuthController } from './controllers/AuthController';
import { CategoryController } from './controllers/CategoryController';
import { OrderController } from './controllers/OrderController';
import { ProductController } from './controllers/ProductController';
import { UserController } from './controllers/UserController';
import { errorMiddleware } from './middleware/errorMiddleware';
import { Category } from './models/Category';
import { Order } from './models/Order';
import { Product } from './models/Product';
import { User } from './models/User';
import { CategoryRepository } from './repositories/CategoryRepository';
import { OrderRepository } from './repositories/OrderRepository';
import { ProductRepository } from './repositories/ProductRepository';
import { UserRepository } from './repositories/UserRepository';
import { createApiRoutes } from './routes';
import { AIService } from './services/AIService';
import { AuthService } from './services/AuthService';
import { CategoryService } from './services/CategoryService';
import { OrderService } from './services/OrderService';
import { ProductService } from './services/ProductService';
import { UserService } from './services/UserService';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Dependency Injection - Repositories
  const userRepository = new UserRepository(AppDataSource.getRepository(User));
  const productRepository = new ProductRepository(AppDataSource.getRepository(Product));
  const orderRepository = new OrderRepository(AppDataSource.getRepository(Order));
  const categoryRepository = new CategoryRepository(AppDataSource.getRepository(Category));

  // Dependency Injection - Services
  const authService = new AuthService(userRepository);
  const productService = new ProductService(productRepository);
  const orderService = new OrderService(orderRepository);
  const categoryService = new CategoryService(categoryRepository);
  const aiService = new AIService();
  const userService = new UserService(userRepository);

  // Dependency Injection - Controllers
  const authController = new AuthController(authService);
  const productController = new ProductController(productService);
  const orderController = new OrderController(orderService);
  const categoryController = new CategoryController(categoryService);
  const aiController = new AIController(aiService);
  const userController = new UserController(userService);

  // Routes
  app.use(
    '/api',
    createApiRoutes(
      productController,
      authController,
      orderController,
      categoryController,
      aiController,
      userController,
    ),
  );

  // Error handling
  app.use(errorMiddleware);

  return app;
}
