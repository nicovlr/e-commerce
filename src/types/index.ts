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

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface TokenPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export interface UpdateStatusBody {
  status: OrderStatus;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export enum UserRole {
  CUSTOMER = 'customer',
  MANAGER = 'manager',
  ADMIN = 'admin',
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

// Analytics types
export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
  limit?: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface OrderMetrics {
  totalOrders: number;
  averageOrderValue: number;
  statusBreakdown: { status: string; count: number }[];
}

export interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: {
    userId: number;
    email: string;
    orderCount: number;
    totalSpent: number;
  }[];
}

export interface StockPerformance {
  totalProducts: number;
  lowStockProducts: {
    productId: number;
    productName: string;
    currentStock: number;
    categoryName: string;
  }[];
  turnoverRate: number;
}

export interface AnalyticsSummary {
  revenue: RevenueDataPoint[];
  topProducts: TopProduct[];
  orderMetrics: OrderMetrics;
  customerInsights: CustomerInsights;
  stockPerformance: StockPerformance;
}
