import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin</h2>
        <nav className="admin-nav">
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Orders
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Categories
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Analytics
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Dashboard IA
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
