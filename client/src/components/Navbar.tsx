import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isStaff = user?.role === 'manager' || user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeDropdown = useCallback(() => {
    setAdminOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!adminOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [adminOpen, closeDropdown]);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          ShopSmart
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/products" className="nav-link">
            Products
          </Link>
          {isAuthenticated && !isStaff && (
            <Link to="/orders" className="nav-link">
              Orders
            </Link>
          )}
          {isAuthenticated && isStaff && (
            <div className="admin-dropdown" ref={dropdownRef}>
              <button
                ref={toggleRef}
                className="nav-link admin-dropdown-toggle"
                onClick={() => setAdminOpen(!adminOpen)}
                aria-expanded={adminOpen}
                aria-haspopup="menu"
              >
                Admin
                <span className="dropdown-arrow" aria-hidden="true">{adminOpen ? '\u25B2' : '\u25BC'}</span>
              </button>
              {adminOpen && (
                <div className="admin-dropdown-menu" role="menu">
                  <Link to="/admin/dashboard" className="admin-dropdown-item" role="menuitem" onClick={() => setAdminOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className="admin-dropdown-item" role="menuitem" onClick={() => setAdminOpen(false)}>
                    Products
                  </Link>
                  <Link to="/admin/orders" className="admin-dropdown-item" role="menuitem" onClick={() => setAdminOpen(false)}>
                    Orders
                  </Link>
                  <Link to="/admin/categories" className="admin-dropdown-item" role="menuitem" onClick={() => setAdminOpen(false)}>
                    Categories
                  </Link>
                  <Link to="/analytics" className="admin-dropdown-item" role="menuitem" onClick={() => setAdminOpen(false)}>
                    Analytics
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="nav-link cart-link" aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}>
            Cart {itemCount > 0 && <span className="cart-badge" aria-hidden="true">{itemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="auth-section">
              <span className="user-name">{user?.firstName}</span>
              <button onClick={handleLogout} className="btn btn-outline" aria-label="Logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
