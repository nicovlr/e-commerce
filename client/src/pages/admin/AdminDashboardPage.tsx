import React, { useEffect, useState } from 'react';
import { Product, DemandPrediction, StockAlert } from '../../types';
import { productService } from '../../services/productService';
import { aiService } from '../../services/aiService';
import { adminService } from '../../services/adminService';

const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [prediction, setPrediction] = useState<DemandPrediction | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [aiHealthy, setAiHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, users: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, alertsData] = await Promise.all([
          productService.getAll({ limit: 1000 }),
          aiService.getAlerts().catch(() => [] as StockAlert[]),
        ]);
        setProducts(productsRes.data);
        setAlerts(alertsData);

        let orderCount = 0;
        let totalRevenue = 0;
        let userCount = 0;
        try {
          const orders = await adminService.getAllOrders();
          orderCount = orders.length;
          totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        } catch { /* orders fetch failed */ }
        try {
          const users = await adminService.getUsers();
          userCount = users.length;
        } catch { /* only admin can list users */ }

        setStats({
          products: productsRes.meta.total,
          orders: orderCount,
          revenue: totalRevenue,
          users: userCount,
        });
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }

      try {
        const health = await aiService.getHealth();
        setAiHealthy(health.status === 'ok' || health.status === 'healthy');
      } catch {
        setAiHealthy(false);
      }
    };
    fetchData();
  }, []);

  const handlePredict = async () => {
    if (selectedProductId === null) return;
    setLoadingPrediction(true);
    setPrediction(null);
    try {
      const result = await aiService.predict(selectedProductId);
      setPrediction(result);
    } catch {
      setError('Failed to get prediction. The AI service may be unavailable.');
    } finally {
      setLoadingPrediction(false);
    }
  };

  const getSeverityClass = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'warning': return 'severity-warning';
      case 'info': return 'severity-info';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <div className="ai-status">
          <span
            className={`status-indicator ${aiHealthy === true ? 'status-online' : aiHealthy === false ? 'status-offline' : 'status-checking'}`}
          />
          <span>
            AI: {aiHealthy === true ? 'Online' : aiHealthy === false ? 'Offline' : 'Checking...'}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Products</span>
          <span className="admin-stat-value">{stats.products}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Orders</span>
          <span className="admin-stat-value">{stats.orders}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Revenue</span>
          <span className="admin-stat-value">${stats.revenue.toFixed(2)}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Users</span>
          <span className="admin-stat-value">{stats.users}</span>
        </div>
      </div>

      {/* Demand Prediction Section */}
      <section className="dashboard-section">
        <h2>Demand Prediction</h2>
        <div className="prediction-controls">
          <select
            className="input"
            value={selectedProductId ?? ''}
            onChange={(e) =>
              setSelectedProductId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handlePredict}
            disabled={selectedProductId === null || loadingPrediction}
          >
            {loadingPrediction ? 'Predicting...' : 'Get Prediction'}
          </button>
        </div>

        {prediction && (
          <div className="prediction-result">
            <h3>Prediction for: {prediction.productName}</h3>
            <div className="prediction-grid">
              <div className="prediction-card">
                <span className="prediction-label">Current Stock</span>
                <span className="prediction-value">{prediction.currentStock}</span>
              </div>
              <div className="prediction-card">
                <span className="prediction-label">Predicted Demand</span>
                <span className="prediction-value">{prediction.predictedDemand}</span>
              </div>
              <div className="prediction-card">
                <span className="prediction-label">Confidence</span>
                <span className="prediction-value">{(prediction.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="recommendation-box">
              <strong>Recommendation:</strong>{' '}
              {prediction.recommendation}
            </div>
          </div>
        )}
      </section>

      {/* Stock Alerts */}
      <section className="dashboard-section">
        <h2>Stock Alerts</h2>
        {alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <p>No stock alerts at this time.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${getSeverityClass(alert.severity)}`}>
                <div className="alert-card-header">
                  <span className={`severity-badge ${getSeverityClass(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <h3 className="alert-product-name">{alert.productName}</h3>
                <p className="alert-message">{alert.message}</p>
                <div className="alert-details">
                  <span>Stock: {alert.currentStock}</span>
                  <span>Threshold: {alert.threshold}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Inventory Overview */}
      <section className="dashboard-section">
        <h2>Inventory Overview</h2>
        {products.length > 0 ? (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      {product.stock === 0 && (
                        <span className="status-badge status-danger">Out of Stock</span>
                      )}
                      {product.stock > 0 && product.stock <= 10 && (
                        <span className="status-badge status-warning">Low Stock</span>
                      )}
                      {product.stock > 10 && (
                        <span className="status-badge status-success">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><p>No products to display.</p></div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;
