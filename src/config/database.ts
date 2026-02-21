import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { Category } from '../models/Category';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Product } from '../models/Product';
import { SalesRecord } from '../models/SalesRecord';
import { User } from '../models/User';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Product, Category, Order, OrderItem, SalesRecord],
  migrations: [],
  subscribers: [],
});
