import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isStaff = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand">ShopSmart</div>
            <p className="footer-tagline">
              Curated collections of exceptional products, designed for those
              who appreciate quality, elegance, and lasting craftsmanship.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Explore</div>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Collection</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Client Services</div>
            <ul className="footer-links">
              <li><Link to="/login">Sign In</Link></li>
              {isAuthenticated && isStaff && (
                <li><Link to="/admin/dashboard">Dashboard</Link></li>
              )}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-text">
            &copy; {new Date().getFullYear()} ShopSmart. All rights reserved.
          </span>
          <span className="footer-text">Crafted with precision.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
