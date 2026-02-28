import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import MetaTags from '../components/MetaTags';
import { AnalyticsSummary } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboardPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const query = {
        granularity,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };
      const summary = await analyticsService.getSummary(query);
      setData(summary);
    } catch {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [granularity, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#e53e3e' }}>{error}</p>
        <button onClick={fetchData} style={buttonStyle}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { revenue, topProducts, orderMetrics, customerInsights, stockPerformance } = data;

  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);
  const totalOrders = orderMetrics.totalOrders;
  const avgOrderValue = orderMetrics.averageOrderValue;
  const ordersPerDay = revenue.length > 0
    ? Math.round((totalOrders / revenue.length) * 10) / 10
    : 0;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <MetaTags title="Analytics Dashboard | ShopSmart" />
      <h1 style={{ marginBottom: '0.5rem' }}>Analytics Dashboard</h1>

      {/* Filters */}
      <div style={filtersStyle}>
        <div style={filterGroupStyle}>
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={filterGroupStyle}>
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={filterGroupStyle}>
          <label>Granularity</label>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as 'day' | 'week' | 'month')}
            style={inputStyle}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={kpiGridStyle}>
        <KPICard title="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
        <KPICard title="Total Orders" value={String(totalOrders)} />
        <KPICard title="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} />
        <KPICard title="Orders / Day" value={String(ordersPerDay)} />
      </div>

      {/* Revenue Chart */}
      <div style={chartContainerStyle}>
        <h3>Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(d: string) => new Date(d).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products + Order Status */}
      <div style={rowStyle}>
        <div style={{ ...chartContainerStyle, flex: 1 }}>
          <h3>Top 10 Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="productName"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="totalRevenue" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...chartContainerStyle, flex: 0, minWidth: '320px' }}>
          <h3>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderMetrics.statusBreakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ status, count }: { status: string; count: number }) => `${status}: ${count}`}
              >
                {orderMetrics.statusBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers */}
      <div style={chartContainerStyle}>
        <h3>Top Customers</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', color: '#718096', fontSize: '0.85rem' }}>
          <span>Total: {customerInsights.totalCustomers}</span>
          <span>New (30d): {customerInsights.newCustomers}</span>
          <span>Returning: {customerInsights.returningCustomers}</span>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Orders</th>
              <th style={thStyle}>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customerInsights.topCustomers.map((c) => (
              <tr key={c.userId}>
                <td style={tdStyle}>{c.email}</td>
                <td style={tdStyle}>{c.orderCount}</td>
                <td style={tdStyle}>${c.totalSpent.toFixed(2)}</td>
              </tr>
            ))}
            {customerInsights.topCustomers.length === 0 && (
              <tr>
                <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#a0aec0' }}>
                  No customer data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Performance */}
      <div style={chartContainerStyle}>
        <h3>Stock Performance</h3>
        <p style={{ color: '#718096', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
          Total active products: {stockPerformance.totalProducts} | Turnover rate: {stockPerformance.turnoverRate}
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {stockPerformance.lowStockProducts.map((p) => (
              <tr key={p.productId}>
                <td style={tdStyle}>{p.productName}</td>
                <td style={tdStyle}>{p.categoryName}</td>
                <td style={{ ...tdStyle, color: p.currentStock <= 5 ? '#e53e3e' : '#dd6b20', fontWeight: 600 }}>
                  {p.currentStock}
                </td>
              </tr>
            ))}
            {stockPerformance.lowStockProducts.length === 0 && (
              <tr>
                <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#38a169' }}>
                  All products are well-stocked
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div style={kpiCardStyle}>
    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>{title}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
  </div>
);

// Styles
const filtersStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
};

const filterGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: '0.85rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '0.9rem',
};

const kpiGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const kpiCardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '1rem 1.25rem',
};

const chartContainerStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '1.5rem',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '2px solid #e2e8f0',
  fontSize: '0.85rem',
  color: '#4a5568',
};

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #edf2f7',
  fontSize: '0.9rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#3182ce',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '0.5rem',
};

export default AnalyticsDashboardPage;
