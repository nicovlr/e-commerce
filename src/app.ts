import cors from 'cors';
import express, { Application, Request, Response } from 'express';

import { AppDataSource } from './config/database';
import { AIController } from './controllers/AIController';
import { AuthController } from './controllers/AuthController';
import { CategoryController } from './controllers/CategoryController';
import { OrderController } from './controllers/OrderController';
import { ProductController } from './controllers/ProductController';
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

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

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
  const orderService = new OrderService(orderRepository, productRepository);
  const categoryService = new CategoryService(categoryRepository);
  const aiService = new AIService();

  // Dependency Injection - Controllers
  const authController = new AuthController(authService);
  const productController = new ProductController(productService);
  const orderController = new OrderController(orderService);
  const categoryController = new CategoryController(categoryService);
  const aiController = new AIController(aiService);

  // Routes
  app.use('/api', createApiRoutes(
    productController,
    authController,
    orderController,
    categoryController,
    aiController,
  ));

  // Error handling
  app.use(errorMiddleware);

  return app;
}
