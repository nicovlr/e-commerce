import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import JsonLd from '../components/JsonLd';
import MetaTags from '../components/MetaTags';
import { getBreadcrumbSchema, getProductListSchema } from '../utils/structuredData';

const PRODUCTS_PER_PAGE = 12;

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: { page: number; limit: number; search?: string; categoryId?: number } = {
        page,
        limit: PRODUCTS_PER_PAGE,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory !== null) params.categoryId = selectedCategory;

      const result = await productService.getAll(params);
      setProducts(result.data);
      setTotalPages(result.meta.totalPages);
      setTotal(result.meta.total);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch {
        // categories are non-critical
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  const sortedProducts = useMemo(() => [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return Number(a.price) - Number(b.price);
      case 'price-desc':
        return Number(b.price) - Number(a.price);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  }), [products, sortBy]);

  return (
    <div className="products-page">
      <MetaTags
        title="Products | ShopSmart"
        description="Browse our catalog of amazing products with intelligent search and filtering."
      />
      <JsonLd data={getBreadcrumbSchema([
        { name: 'Home', url: 'https://shopsmart.com/' },
        { name: 'Products', url: 'https://shopsmart.com/products' }
      ])} />
      <JsonLd data={getProductListSchema(sortedProducts)} />
      <div className="container">
        <h1>Our Products</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters-bar">
          <div className="filter-group">
            <input
              type="text"
              className="input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="filter-group">
            <select
              className="input"
              value={selectedCategory ?? ''}
              onChange={(e) =>
                setSelectedCategory(e.target.value ? Number(e.target.value) : null)
              }
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price-asc' | 'price-desc')}
              aria-label="Sort products"
            >
              <option value="name">Sort by Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <p className="results-count">{total} products found</p>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading products...</p>
          </div>
        ) : sortedProducts.length > 0 ? (
          <>
            <div className="product-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No products match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
