export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
  category?: Category;
  created_at?: string;
  updated_at?: string;
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
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  created_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DemandPrediction {
  product_id: number;
  product_name: string;
  current_stock: number;
  predicted_demand: number;
  confidence: number;
  recommendation: string;
}

export interface StockAlert {
  id: number;
  product_id: number;
  product_name: string;
  alert_type: 'low_stock' | 'overstock' | 'trending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  current_stock: number;
  threshold: number;
  created_at?: string;
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
