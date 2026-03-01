import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { Category } from '../models/Category';
import { Delivery } from '../models/Delivery';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Product } from '../models/Product';
import { SalesRecord } from '../models/SalesRecord';
import { User } from '../models/User';
import { InitialSchema1709000000000 } from '../migrations/1709000000000-InitialSchema';
import { AddPaymentFields1709100000000 } from '../migrations/1709100000000-AddPaymentFields';
import { AddDeliveries1709200000000 } from '../migrations/1709200000000-AddDeliveries';

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
    console.warn('[database] Using default database credentials in production — this is a security risk');
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Product, Category, Order, OrderItem, SalesRecord, Delivery],
  migrations: [InitialSchema1709000000000, AddPaymentFields1709100000000, AddDeliveries1709200000000],
  subscribers: [],
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});
