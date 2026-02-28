import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getAll();
        setFeaturedProducts(products.slice(0, 6));
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
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">New Collection 2026</span>
          <h1>Discover <em>Premium</em> Products</h1>
          <p>
            Curated collections of exceptional products, designed for those who appreciate
            quality, elegance, and attention to detail.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore the Collection
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">
              View Catalogue
            </Link>
          </div>
        </div>
        <div className="hero-scroll-cue">
          <span>Scroll</span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="7" cy="6" r="1.5" fill="currentColor">
              <animateTransform attributeName="transform" type="translate"
                values="0,0; 0,5; 0,0" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title-decorated">Our Selection</h2>

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

          {!loading && !error && featuredProducts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/products" className="btn btn-outline btn-lg">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section features-section">
        <div className="container">
          <h2 className="section-title-decorated">Why ShopSmart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">&#x1f4e6;</div>
              <h3>Free Shipping</h3>
              <p>
                Complimentary delivery on all orders. Your items arrive safely at your doorstep.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x1f512;</div>
              <h3>Secure Payment</h3>
              <p>
                Your transactions are protected with industry-leading encryption technology.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x2728;</div>
              <h3>Premium Quality</h3>
              <p>
                Every product is carefully selected to meet the highest standards of excellence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
