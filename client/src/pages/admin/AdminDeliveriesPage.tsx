import React, { useState, useEffect, useCallback } from 'react';
import { Delivery } from '../../types';
import { deliveryService } from '../../services/deliveryService';
import { useToast } from '../../context/ToastContext';

const ITEMS_PER_PAGE = 20;
const DELIVERY_STATUSES = ['preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed'] as const;

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

const formatStatus = (status: string): string =>
  status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const AdminDeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [form, setForm] = useState({ orderId: '', carrier: '', trackingNumber: '', estimatedDeliveryDate: '', notes: '' });
  const { showToast } = useToast();

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const result = await deliveryService.getAll({ page, limit: ITEMS_PER_PAGE });
      setDeliveries(result.data);
      setTotalPages(result.meta.totalPages);
      setTotal(result.meta.total);
    } catch {
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const handleStatusChange = async (deliveryId: number, newStatus: string) => {
    try {
      await deliveryService.updateStatus(deliveryId, newStatus);
      setDeliveries(prev =>
        prev.map(d => d.id === deliveryId ? { ...d, status: newStatus as Delivery['status'] } : d)
      );
      showToast('Delivery status updated', 'success');
    } catch {
      showToast('Failed to update delivery status', 'error');
    }
  };

  const openCreate = () => {
    setEditingDelivery(null);
    setForm({ orderId: '', carrier: '', trackingNumber: '', estimatedDeliveryDate: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setForm({
      orderId: String(delivery.orderId),
      carrier: delivery.carrier || '',
      trackingNumber: delivery.trackingNumber || '',
      estimatedDeliveryDate: delivery.estimatedDeliveryDate
        ? new Date(delivery.estimatedDeliveryDate).toISOString().split('T')[0]
        : '',
      notes: delivery.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDelivery) {
        await deliveryService.update(editingDelivery.id, {
          carrier: form.carrier || null,
          trackingNumber: form.trackingNumber || null,
          estimatedDeliveryDate: form.estimatedDeliveryDate || null,
          notes: form.notes || null,
        });
        showToast('Delivery updated', 'success');
      } else {
        await deliveryService.create({
          orderId: Number(form.orderId),
          carrier: form.carrier || undefined,
          estimatedDeliveryDate: form.estimatedDeliveryDate || undefined,
          notes: form.notes || undefined,
        });
        showToast('Delivery created', 'success');
      }
      setShowModal(false);
      fetchDeliveries();
    } catch {
      showToast(editingDelivery ? 'Failed to update delivery' : 'Failed to create delivery', 'error');
    }
  };

  const filtered = filterStatus === 'all'
    ? deliveries
    : deliveries.filter((d) => d.status === filterStatus);

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Deliveries</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className="results-count">{total} deliveries</span>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            + New Delivery
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-filter-bar">
        <select
          className="input admin-status-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {DELIVERY_STATUSES.map((s) => (
            <option key={s} value={s}>{formatStatus(s)}</option>
          ))}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {filtered.length} shown
        </span>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Order</th>
              <th>Carrier</th>
              <th>Tracking</th>
              <th>Status</th>
              <th>Est. Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((delivery) => (
              <tr key={delivery.id}>
                <td style={{ fontWeight: 500 }}>#{delivery.id}</td>
                <td>Order #{delivery.orderId}</td>
                <td>{delivery.carrier || '-'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {delivery.trackingNumber || '-'}
                </td>
                <td>
                  <span className={`status-badge ${getDeliveryStatusClass(delivery.status)}`}>
                    {formatStatus(delivery.status)}
                  </span>
                </td>
                <td>
                  {delivery.estimatedDeliveryDate
                    ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <select
                      className="input admin-status-select"
                      value={delivery.status}
                      onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
                    >
                      {DELIVERY_STATUSES.map((s) => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => openEdit(delivery)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No deliveries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingDelivery ? 'Edit Delivery' : 'Create Delivery'}</h2>
            <form onSubmit={handleSubmit}>
              {!editingDelivery && (
                <div className="form-group">
                  <label>Order ID</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Carrier</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. UPS, FedEx, DHL"
                  value={form.carrier}
                  onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                />
              </div>
              {editingDelivery && (
                <div className="form-group">
                  <label>Tracking Number</label>
                  <input
                    className="input"
                    type="text"
                    value={form.trackingNumber}
                    onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Estimated Delivery Date</label>
                <input
                  className="input"
                  type="date"
                  value={form.estimatedDeliveryDate}
                  onChange={(e) => setForm({ ...form, estimatedDeliveryDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="form-row" style={{ justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDelivery ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeliveriesPage;
