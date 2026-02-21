import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>ShopSmart &copy; {new Date().getFullYear()} - AI-Powered E-Commerce Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
