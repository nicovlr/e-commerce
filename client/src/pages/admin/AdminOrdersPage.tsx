import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { getStatusClass } from '../../utils/orderStatus';

const ORDERS_PER_PAGE = 20;
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await orderService.getAll({ page, limit: ORDERS_PER_PAGE });
      setOrders(result.data);
      setTotalPages(result.meta.totalPages);
      setTotal(result.meta.total);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
      showToast('Order status updated', 'success');
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Orders</h1>
        <span className="results-count">{total} orders</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                <td>{order.items?.length || 0} item(s)</td>
                <td>${Number(order.totalAmount).toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <select
                    className="input admin-status-select"
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
