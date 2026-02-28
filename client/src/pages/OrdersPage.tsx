import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import api from '../services/api';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<Order[]>('/orders/my-orders');
        setOrders(response.data);
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'delivered':
        return 'status-success';
      case 'cancelled':
        return 'status-danger';
      case 'pending':
      case 'processing':
        return 'status-warning';
      case 'shipped':
        return 'status-info';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {!error && orders.length === 0 && (
          <div className="empty-state">
            <h2>No orders yet</h2>
            <p>You haven't placed any orders. Start shopping to see your order history here.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order #{order.id}</span>
                    {order.created_at && (
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items-list">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <span className="order-item-name">
                          {item.product?.name || `Product #${item.product_id}`}
                        </span>
                        <span className="order-item-qty">x{item.quantity}</span>
                        <span className="order-item-price">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-card-footer">
                  <span className="order-total">Total: ${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
