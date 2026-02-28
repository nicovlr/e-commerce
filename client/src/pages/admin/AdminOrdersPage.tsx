import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { adminService } from '../../services/adminService';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const updated = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)));
    } catch {
      setError('Failed to update order status.');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading orders...</p></div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Orders</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-filter-bar">
        <select
          className="admin-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  className="admin-toggle-row"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <td style={{ fontWeight: 500 }}>#{order.id}</td>
                  <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : `User #${order.userId}`}</td>
                  <td>${Number(order.totalAmount).toFixed(2)}</td>
                  <td>
                    <span className={`badge-status badge-status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="admin-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {expandedId === order.id && order.items && (
                  <tr>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div className="admin-order-detail">
                        <table>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Qty</th>
                              <th>Unit Price</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td>{item.product?.name || `Product #${item.productId}`}</td>
                                <td>{item.quantity}</td>
                                <td>${Number(item.unitPrice).toFixed(2)}</td>
                                <td>${(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
