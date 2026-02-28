import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const categoryEmoji: Record<string, string> = {
  electronics: '\u{1F4F1}',
  clothing: '\u{1F45A}',
  books: '\u{1F4DA}',
  home: '\u{1F3E0}',
  sports: '\u{26BD}',
  food: '\u{1F34E}',
  beauty: '\u{2728}',
  toys: '\u{1F381}',
};

const getPlaceholderEmoji = (categoryName?: string): string => {
  if (!categoryName) return '\u{1F6CD}';
  const key = categoryName.toLowerCase();
  for (const [k, v] of Object.entries(categoryEmoji)) {
    if (key.includes(k)) return v;
  }
  return '\u{1F6CD}';
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const hasImage = product.image_url && product.image_url.trim() !== '';

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-wrapper">
          {hasImage ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const wrapper = target.parentElement;
                if (wrapper && !wrapper.querySelector('.product-placeholder')) {
                  const placeholder = document.createElement('span');
                  placeholder.className = 'product-placeholder';
                  placeholder.textContent = getPlaceholderEmoji(product.category?.name);
                  wrapper.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <span className="product-placeholder">
              {getPlaceholderEmoji(product.category?.name)}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="stock-badge low-stock">Low Stock</span>
          )}
          {product.stock === 0 && <span className="stock-badge out-of-stock">Out of Stock</span>}
          <div className="product-card-overlay">
            <span>View</span>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">
            {product.description?.substring(0, 80)}
            {product.description && product.description.length > 80 ? '...' : ''}
          </p>
          <div className="product-footer">
            <span className="product-price">${Number(product.price).toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-sm"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
