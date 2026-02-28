import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import JsonLd from '../components/JsonLd';
import MetaTags from '../components/MetaTags';
import { getOrganizationSchema, getWebSiteSchema } from '../utils/structuredData';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await productService.getAll({ limit: 6 });
        setFeaturedProducts(result.data);
      } catch {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      <MetaTags
        title="ShopSmart - AI-Powered E-Commerce"
        description="Discover amazing products with intelligent inventory management and demand forecasting."
      />
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebSiteSchema()} />
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ShopSmart</h1>
          <p>
            Your AI-powered shopping destination. Discover amazing products with intelligent
            inventory management and demand forecasting.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse Products
            </Link>
            <Link to="/dashboard" className="btn btn-outline btn-lg">
              AI Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="btn btn-outline">
              View All
            </Link>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading products...</p>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && !error && featuredProducts.length === 0 && (
            <div className="empty-state">
              <p>No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <section className="section features-section">
        <div className="container">
          <h2 className="text-center">Why ShopSmart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">&#x1f4ca;</div>
              <h3>AI-Powered Insights</h3>
              <p>
                Smart demand prediction and inventory management powered by machine learning.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x1f6d2;</div>
              <h3>Easy Shopping</h3>
              <p>
                Browse, filter, and purchase products with a clean and intuitive interface.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x1f514;</div>
              <h3>Stock Alerts</h3>
              <p>
                Real-time alerts for low stock, trending items, and inventory optimization.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
