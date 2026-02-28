import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Category } from '../../types';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' });
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodsResult, cats] = await Promise.all([productService.getAll(), productService.getCategories()]);
      setProducts(prodsResult.data);
      setCategories(cats);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl || '',
      categoryId: String(product.categoryId),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
        categoryId: Number(form.categoryId),
      };
      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        showToast('Product updated', 'success');
      } else {
        await productService.create(payload as Omit<Product, 'id'>);
        showToast('Product created', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch {
      showToast('Failed to save product', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productService.delete(id);
      showToast('Product deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products</h1>
        <button ref={triggerRef} className="btn btn-primary" onClick={openCreate}>Add Product</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{categories.find(c => c.id === p.categoryId)?.name || '-'}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${p.stock === 0 ? 'status-danger' : p.stock < 10 ? 'status-warning' : 'status-success'}`}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => { setShowModal(false); triggerRef.current?.focus(); }}
          onKeyDown={e => { if (e.key === 'Escape') { setShowModal(false); triggerRef.current?.focus(); } }}
        >
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onClick={e => e.stopPropagation()}>
            <h2 id="product-modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="product-name">Name</label>
                <input id="product-name" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="product-description">Description</label>
                <textarea id="product-description" className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-price">Price</label>
                  <input id="product-price" className="input" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label htmlFor="product-stock">Stock</label>
                  <input id="product-stock" className="input" type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="product-image">Image URL</label>
                <input id="product-image" className="input" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="product-category">Category</label>
                <select id="product-category" className="input" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); triggerRef.current?.focus(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
