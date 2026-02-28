import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Admin</div>
        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            Products
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            Categories
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            Orders
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            Analytics
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              Users
            </NavLink>
          )}
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
