import React, { useEffect, useState } from 'react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getAll(),
          productService.getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== null && p.category_id !== selectedCategory) return false;
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>Products</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters-bar">
          <div className="filter-group">
            <input
              type="text"
              className="input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="input"
              value={selectedCategory ?? ''}
              onChange={(e) =>
                setSelectedCategory(e.target.value ? Number(e.target.value) : null)
              }
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
            >
              <option value="name">Sort by Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <p className="results-count">{filteredProducts.length} products found</p>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
