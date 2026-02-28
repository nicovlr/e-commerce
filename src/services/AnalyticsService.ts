import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import {
  AnalyticsQuery,
  AnalyticsSummary,
  CustomerInsights,
  OrderMetrics,
  RevenueDataPoint,
  StockPerformance,
  TopProduct,
} from '../types';

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  private parseQuery(raw: Record<string, unknown>): AnalyticsQuery {
    const startDate = typeof raw.startDate === 'string' ? raw.startDate : undefined;
    const endDate = typeof raw.endDate === 'string' ? raw.endDate : undefined;
    const granStr = typeof raw.granularity === 'string' ? raw.granularity : 'day';
    const granularity = (['day', 'week', 'month'] as const).includes(
      granStr as 'day' | 'week' | 'month',
    )
      ? (granStr as 'day' | 'week' | 'month')
      : 'day';
    const limit =
      typeof raw.limit === 'string' ? parseInt(raw.limit, 10) : undefined;

    return { startDate, endDate, granularity, limit };
  }

  async getSummary(rawQuery: Record<string, unknown>): Promise<AnalyticsSummary> {
    const query = this.parseQuery(rawQuery);
    const [revenue, topProducts, orderMetrics, customerInsights, stockPerformance] =
      await Promise.all([
        this.analyticsRepository.getRevenue(query),
        this.analyticsRepository.getTopProducts(query),
        this.analyticsRepository.getOrderMetrics(query),
        this.analyticsRepository.getCustomerInsights(query),
        this.analyticsRepository.getStockPerformance(),
      ]);

    return { revenue, topProducts, orderMetrics, customerInsights, stockPerformance };
  }

  async getRevenue(rawQuery: Record<string, unknown>): Promise<RevenueDataPoint[]> {
    return this.analyticsRepository.getRevenue(this.parseQuery(rawQuery));
  }

  async getTopProducts(rawQuery: Record<string, unknown>): Promise<TopProduct[]> {
    return this.analyticsRepository.getTopProducts(this.parseQuery(rawQuery));
  }

  async getOrderMetrics(rawQuery: Record<string, unknown>): Promise<OrderMetrics> {
    return this.analyticsRepository.getOrderMetrics(this.parseQuery(rawQuery));
  }

  async getCustomerInsights(rawQuery: Record<string, unknown>): Promise<CustomerInsights> {
    return this.analyticsRepository.getCustomerInsights(this.parseQuery(rawQuery));
  }

  async getStockPerformance(): Promise<StockPerformance> {
    return this.analyticsRepository.getStockPerformance();
  }
}
