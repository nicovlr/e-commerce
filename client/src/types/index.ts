export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutResponse {
  orderId: number;
  clientSecret: string;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: PaymentStatus;
  shippingAddress?: ShippingAddress | null;
  items: OrderItem[];
  createdAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DemandPrediction {
  productId: number;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  confidence: number;
  recommendation: string;
}

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  alertType: 'low_stock' | 'overstock' | 'trending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentStock: number;
  threshold: number;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
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
