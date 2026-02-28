import React, { useEffect, useState } from 'react';
import { Category } from '../../types';
import { productService } from '../../services/productService';

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await productService.updateCategory(editingId, { name, description });
      } else {
        await productService.createCategory({ name, description });
      }
      resetForm();
      await fetchCategories();
    } catch {
      setError('Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await productService.deleteCategory(deleteId);
      setDeleteId(null);
      await fetchCategories();
    } catch {
      setError('Failed to delete category. It may have associated products.');
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading categories...</p></div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Categories</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-inline-form">
        <div className="form-group">
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
        )}
      </form>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 500 }}>{cat.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{cat.description || '—'}</td>
                <td>
                  <div className="admin-actions">
                    <button className="btn btn-outline" onClick={() => startEdit(cat)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => setDeleteId(cat.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteId !== null && (
        <div className="admin-confirm-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Category</h3>
            <p>Are you sure? Products in this category may be affected.</p>
            <div className="admin-confirm-actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
