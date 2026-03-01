import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order, Delivery } from '../types';
import api from '../services/api';
import { deliveryService } from '../services/deliveryService';
import { getStatusClass } from '../utils/orderStatus';

const formatDeliveryStatus = (status: string): string =>
  status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const getDeliveryStatusClass = (status: string): string => {
  switch (status) {
    case 'delivered': return 'status-success';
    case 'failed': return 'status-danger';
    case 'shipped':
    case 'in_transit': return 'status-info';
    case 'out_for_delivery': return 'status-warning';
    default: return 'status-warning';
  }
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Record<number, Delivery>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<{ data: Order[] } | Order[]>('/orders/my-orders');
        const orderList = Array.isArray(response.data) ? response.data : response.data.data;
        setOrders(orderList);

        // Fetch deliveries for each order
        const deliveryMap: Record<number, Delivery> = {};
        await Promise.allSettled(
          orderList.map(async (order) => {
            try {
              const delivery = await deliveryService.getByOrderId(order.id);
              deliveryMap[order.id] = delivery;
            } catch {
              // No delivery for this order
            }
          })
        );
        setDeliveries(deliveryMap);
      } catch {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            {orders.map((order) => {
              const delivery = deliveries[order.id];
              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">Order #{order.id}</span>
                      {order.createdAt && (
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="order-badges">
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.paymentStatus && (
                        <span className={`status-badge payment-badge payment-${order.paymentStatus}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="order-items-list">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item-row">
                          <span className="order-item-name">
                            {item.product?.name || `Product #${item.productId}`}
                          </span>
                          <span className="order-item-qty">x{item.quantity}</span>
                          <span className="order-item-price">${Number(item.unitPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {delivery && (
                    <div className="delivery-info" style={{
                      marginTop: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'var(--cream-light, #faf8f5)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <strong style={{ fontSize: '0.875rem' }}>Delivery</strong>
                        <span className={`status-badge ${getDeliveryStatusClass(delivery.status)}`}>
                          {formatDeliveryStatus(delivery.status)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        {delivery.carrier && (
                          <span>Carrier: {delivery.carrier}</span>
                        )}
                        {delivery.trackingNumber && (
                          <span>Tracking: <code style={{ fontSize: '0.8rem' }}>{delivery.trackingNumber}</code></span>
                        )}
                        {delivery.estimatedDeliveryDate && (
                          <span>
                            Est. delivery: {new Date(delivery.estimatedDeliveryDate).toLocaleDateString()}
                          </span>
                        )}
                        {delivery.deliveredAt && (
                          <span>
                            Delivered: {new Date(delivery.deliveredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="order-card-footer">
                    <span className="order-total">Total: ${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
