import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category } from '../../types';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, form);
        showToast('Category updated', 'success');
      } else {
        await categoryService.create(form);
        showToast('Category created', 'success');
      }
      setShowModal(false);
      fetchCategories();
    } catch {
      showToast('Failed to save category', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryService.delete(id);
      showToast('Category deleted', 'success');
      fetchCategories();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Categories</h1>
        <button ref={triggerRef} className="btn btn-primary" onClick={openCreate}>Add Category</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description || '-'}</td>
                <td>
                  <div className="admin-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
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
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onClick={e => e.stopPropagation()}>
            <h2 id="category-modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="category-name">Name</label>
                <input id="category-name" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label htmlFor="category-description">Description</label>
                <textarea id="category-description" className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); triggerRef.current?.focus(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCategory ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
