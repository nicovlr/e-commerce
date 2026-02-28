import api from './api';
import {
  AnalyticsQuery,
  AnalyticsSummary,
  RevenueDataPoint,
  TopProduct,
  OrderMetrics,
  CustomerInsights,
  StockPerformance,
} from '../types';

export const analyticsService = {
  async getSummary(query?: AnalyticsQuery): Promise<AnalyticsSummary> {
    const response = await api.get<AnalyticsSummary>('/analytics/summary', { params: query });
    return response.data;
  },

  async getRevenue(query?: AnalyticsQuery): Promise<RevenueDataPoint[]> {
    const response = await api.get<RevenueDataPoint[]>('/analytics/revenue', { params: query });
    return response.data;
  },

  async getTopProducts(query?: AnalyticsQuery): Promise<TopProduct[]> {
    const response = await api.get<TopProduct[]>('/analytics/top-products', { params: query });
    return response.data;
  },

  async getOrderMetrics(query?: AnalyticsQuery): Promise<OrderMetrics> {
    const response = await api.get<OrderMetrics>('/analytics/orders', { params: query });
    return response.data;
  },

  async getCustomerInsights(query?: AnalyticsQuery): Promise<CustomerInsights> {
    const response = await api.get<CustomerInsights>('/analytics/customers', { params: query });
    return response.data;
  },

  async getStockPerformance(): Promise<StockPerformance> {
    const response = await api.get<StockPerformance>('/analytics/stock');
    return response.data;
  },
};
