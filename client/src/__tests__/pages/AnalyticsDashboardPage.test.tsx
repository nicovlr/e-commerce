import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsDashboardPage from '../../pages/AnalyticsDashboardPage';
import { renderWithProviders } from '../../test-helpers';
import { analyticsService } from '../../services/analyticsService';

jest.mock('../../services/analyticsService');
// Mock recharts to avoid SVG rendering issues in jsdom
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Legend: () => null,
}));

const mockedAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

const mockSummary = {
  revenue: [
    { date: '2024-02-01', revenue: 500, orderCount: 3 },
    { date: '2024-02-02', revenue: 800, orderCount: 5 },
  ],
  topProducts: [
    { productId: 1, productName: 'MacBook Pro', totalRevenue: 5000, totalQuantity: 2 },
    { productId: 2, productName: 'iPhone', totalRevenue: 2400, totalQuantity: 2 },
  ],
  orderMetrics: {
    totalOrders: 13,
    averageOrderValue: 859.22,
    statusBreakdown: [
      { status: 'pending', count: 5 },
      { status: 'delivered', count: 4 },
      { status: 'cancelled', count: 4 },
    ],
  },
  customerInsights: {
    totalCustomers: 4,
    newCustomers: 4,
    returningCustomers: 4,
    topCustomers: [
      { userId: 1, email: 'alice@test.com', orderCount: 3, totalSpent: 3349.96 },
    ],
  },
  stockPerformance: {
    totalProducts: 12,
    turnoverRate: 0.42,
    lowStockProducts: [
      { productId: 1, productName: 'Sony WH-1000XM5', categoryName: 'Electronics', currentStock: 3 },
    ],
  },
};

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockedAnalyticsService.getSummary.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AnalyticsDashboardPage />);

    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders dashboard with data after loading', async () => {
    mockedAnalyticsService.getSummary.mockResolvedValue(mockSummary);
    renderWithProviders(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    // KPI cards
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
    expect(screen.getByText('Orders / Day')).toBeInTheDocument();
  });

  it('displays revenue and order values from data', async () => {
    mockedAnalyticsService.getSummary.mockResolvedValue(mockSummary);
    renderWithProviders(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('13')).toBeInTheDocument(); // total orders
    });

    // ordersPerDay = Math.round((13 / 2) * 10) / 10 = 6.5
    expect(screen.getByText('6.5')).toBeInTheDocument();
  });

  it('renders chart sections', async () => {
    mockedAnalyticsService.getSummary.mockResolvedValue(mockSummary);
    renderWithProviders(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Revenue Over Time')).toBeInTheDocument();
    });

    expect(screen.getByText('Top 10 Products by Revenue')).toBeInTheDocument();
    expect(screen.getByText('Order Status Breakdown')).toBeInTheDocument();
  });

  it('renders customer and stock tables', async () => {
    mockedAnalyticsService.getSummary.mockResolvedValue(mockSummary);
    renderWithProviders(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Top Customers')).toBeInTheDocument();
    });

    expect(screen.getByText('Stock Performance')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Sony WH-1000XM5')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    mockedAnalyticsService.getSummary.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument();
    });
  });

  it('renders granularity filter', async () => {
    mockedAnalyticsService.getSummary.mockResolvedValue(mockSummary);
    renderWithProviders(<AnalyticsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Day')).toBeInTheDocument();
  });
});
