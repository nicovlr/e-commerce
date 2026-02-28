import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: 'customer' | 'manager' | 'admin';
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
}

export interface DemandPrediction {
  productId: number;
  productName: string;
  currentStock: number;
  predictedDemand7d: number;
  predictedDemand14d: number;
  predictedDemand30d: number;
  restockRecommended: boolean;
}

export interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilStockout: number;
  severity: 'critical' | 'warning' | 'info';
}
