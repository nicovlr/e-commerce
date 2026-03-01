import { DataSource } from 'typeorm';

import { config } from '../config';
import {
  AnalyticsQuery,
  CustomerInsights,
  OrderMetrics,
  RevenueDataPoint,
  StockPerformance,
  TopProduct,
} from '../types';

interface RawRevenueRow {
  date: string;
  revenue: string;
  orderCount: string;
}

interface RawTopProductRow {
  productId: string;
  productName: string;
  totalQuantity: string;
  totalRevenue: string;
}

interface RawCountRow {
  count: string;
}

interface RawTotalsRow {
  totalOrders: string;
  averageOrderValue: string;
}

interface RawStatusRow {
  status: string;
  count: string;
}

interface RawTopCustomerRow {
  userId: string;
  email: string;
  orderCount: string;
  totalSpent: string;
}

interface RawLowStockRow {
  productId: string;
  productName: string;
  currentStock: string;
  categoryName: string;
}

interface RawSoldRow {
  totalSold: string;
}

interface RawAvgStockRow {
  avgStock: string;
}

export class AnalyticsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getRevenue(query: AnalyticsQuery): Promise<RevenueDataPoint[]> {
    const { startDate, endDate, granularity = 'day' } = query;

    let dateTrunc: string;
    switch (granularity) {
      case 'week':
        dateTrunc = "date_trunc('week', o.\"createdAt\")";
        break;
      case 'month':
        dateTrunc = "date_trunc('month', o.\"createdAt\")";
        break;
      default:
        dateTrunc = "date_trunc('day', o.\"createdAt\")";
    }

    const qb = this.dataSource
      .createQueryBuilder()
      .select(`${dateTrunc}`, 'date')
      .addSelect('COALESCE(SUM(o."totalAmount"), 0)', 'revenue')
      .addSelect('COUNT(o.id)', 'orderCount')
      .from('orders', 'o')
      .where("o.status != 'cancelled'")
      .groupBy('date')
      .orderBy('date', 'ASC');

    if (startDate) {
      qb.andWhere('o."createdAt" >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('o."createdAt" <= :endDate', { endDate });
    }

    const rows: RawRevenueRow[] = await qb.getRawMany();
    return rows.map((r) => ({
      date: r.date,
      revenue: parseFloat(r.revenue),
      orderCount: parseInt(r.orderCount, 10),
    }));
  }

  async getTopProducts(query: AnalyticsQuery): Promise<TopProduct[]> {
    const { startDate, endDate, limit = 10 } = query;

    const qb = this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('SUM(oi.quantity)', 'totalQuantity')
      .addSelect('SUM(oi.quantity * oi."unitPrice")', 'totalRevenue')
      .from('order_items', 'oi')
      .innerJoin('products', 'p', 'p.id = oi."productId"')
      .innerJoin('orders', 'o', 'o.id = oi."orderId"')
      .where("o.status != 'cancelled'")
      .groupBy('p.id')
      .addGroupBy('p.name')
      .orderBy('"totalRevenue"', 'DESC')
      .limit(limit);

    if (startDate) {
      qb.andWhere('o."createdAt" >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('o."createdAt" <= :endDate', { endDate });
    }

    const rows: RawTopProductRow[] = await qb.getRawMany();
    return rows.map((r) => ({
      productId: parseInt(r.productId, 10),
      productName: r.productName,
      totalQuantity: parseInt(r.totalQuantity, 10),
      totalRevenue: parseFloat(r.totalRevenue),
    }));
  }

  async getOrderMetrics(query: AnalyticsQuery): Promise<OrderMetrics> {
    const { startDate, endDate } = query;

    const baseQb = this.dataSource.createQueryBuilder().from('orders', 'o');

    if (startDate) {
      baseQb.andWhere('o."createdAt" >= :startDate', { startDate });
    }
    if (endDate) {
      baseQb.andWhere('o."createdAt" <= :endDate', { endDate });
    }

    const totalsQb = baseQb
      .clone()
      .select('COUNT(o.id)', 'totalOrders')
      .addSelect('COALESCE(AVG(o."totalAmount"), 0)', 'averageOrderValue');

    const totals = (await totalsQb.getRawOne()) as RawTotalsRow;

    const statusQb = this.dataSource
      .createQueryBuilder()
      .select('o.status', 'status')
      .addSelect('COUNT(o.id)', 'count')
      .from('orders', 'o')
      .groupBy('o.status');

    if (startDate) {
      statusQb.andWhere('o."createdAt" >= :startDate', { startDate });
    }
    if (endDate) {
      statusQb.andWhere('o."createdAt" <= :endDate', { endDate });
    }

    const statusRows: RawStatusRow[] = await statusQb.getRawMany();

    return {
      totalOrders: parseInt(totals.totalOrders, 10),
      averageOrderValue: parseFloat(totals.averageOrderValue),
      statusBreakdown: statusRows.map((r) => ({
        status: r.status,
        count: parseInt(r.count, 10),
      })),
    };
  }

  async getCustomerInsights(query: AnalyticsQuery): Promise<CustomerInsights> {
    const { startDate, endDate, limit = 10 } = query;

    const totalCustomers = (await this.dataSource
      .createQueryBuilder()
      .select('COUNT(DISTINCT u.id)', 'count')
      .from('users', 'u')
      .where("u.role = 'customer'")
      .getRawOne()) as RawCountRow;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = (await this.dataSource
      .createQueryBuilder()
      .select('COUNT(u.id)', 'count')
      .from('users', 'u')
      .where("u.role = 'customer'")
      .andWhere('u."createdAt" >= :since', { since: thirtyDaysAgo.toISOString() })
      .getRawOne()) as RawCountRow;

    const returningQb = this.dataSource
      .createQueryBuilder()
      .select('COUNT(DISTINCT sub."userId")', 'count')
      .from((subQuery) => {
        const sq = subQuery
          .select('o."userId"')
          .from('orders', 'o')
          .groupBy('o."userId"')
          .having('COUNT(o.id) > 1');
        if (startDate) sq.andWhere('o."createdAt" >= :startDate', { startDate });
        if (endDate) sq.andWhere('o."createdAt" <= :endDate', { endDate });
        return sq;
      }, 'sub');

    const returning = (await returningQb.getRawOne()) as RawCountRow;

    const topQb = this.dataSource
      .createQueryBuilder()
      .select('u.id', 'userId')
      .addSelect('u.email', 'email')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('COALESCE(SUM(o."totalAmount"), 0)', 'totalSpent')
      .from('users', 'u')
      .innerJoin('orders', 'o', 'o."userId" = u.id')
      .where("o.status != 'cancelled'")
      .groupBy('u.id')
      .addGroupBy('u.email')
      .orderBy('"totalSpent"', 'DESC')
      .limit(limit);

    if (startDate) {
      topQb.andWhere('o."createdAt" >= :startDate', { startDate });
    }
    if (endDate) {
      topQb.andWhere('o."createdAt" <= :endDate', { endDate });
    }

    const topRows: RawTopCustomerRow[] = await topQb.getRawMany();

    return {
      totalCustomers: parseInt(totalCustomers.count, 10),
      newCustomers: parseInt(newCustomers.count, 10),
      returningCustomers: parseInt(returning.count, 10),
      topCustomers: topRows.map((r) => ({
        userId: parseInt(r.userId, 10),
        email: r.email,
        orderCount: parseInt(r.orderCount, 10),
        totalSpent: parseFloat(r.totalSpent),
      })),
    };
  }

  async getStockPerformance(): Promise<StockPerformance> {
    const totalProducts = (await this.dataSource
      .createQueryBuilder()
      .select('COUNT(p.id)', 'count')
      .from('products', 'p')
      .where('p."isActive" = true')
      .getRawOne()) as RawCountRow;

    const lowStock: RawLowStockRow[] = await this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.stock', 'currentStock')
      .addSelect('c.name', 'categoryName')
      .from('products', 'p')
      .leftJoin('categories', 'c', 'c.id = p."categoryId"')
      .where('p.stock <= :threshold', { threshold: config.stock.lowThreshold })
      .andWhere('p."isActive" = true')
      .orderBy('p.stock', 'ASC')
      .getRawMany();

    // Turnover rate: total items sold / average stock level
    const sold = (await this.dataSource
      .createQueryBuilder()
      .select('COALESCE(SUM(oi.quantity), 0)', 'totalSold')
      .from('order_items', 'oi')
      .innerJoin('orders', 'o', 'o.id = oi."orderId"')
      .where("o.status != 'cancelled'")
      .getRawOne()) as RawSoldRow;

    const avgStock = (await this.dataSource
      .createQueryBuilder()
      .select('COALESCE(AVG(p.stock), 1)', 'avgStock')
      .from('products', 'p')
      .where('p."isActive" = true')
      .getRawOne()) as RawAvgStockRow;

    const turnoverRate = parseFloat(sold.totalSold) / parseFloat(avgStock.avgStock);

    return {
      totalProducts: parseInt(totalProducts.count, 10),
      lowStockProducts: lowStock.map((r) => ({
        productId: parseInt(r.productId, 10),
        productName: r.productName,
        currentStock: parseInt(r.currentStock, 10),
        categoryName: r.categoryName || 'Uncategorized',
      })),
      turnoverRate: Math.round(turnoverRate * 100) / 100,
    };
  }
}
