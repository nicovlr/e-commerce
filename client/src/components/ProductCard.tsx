import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { getPlaceholderEmoji } from '../utils/categoryEmoji';

const LOW_STOCK_THRESHOLD = 5;

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const hasImage = product.imageUrl && product.imageUrl.trim() !== '' && !imgError;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-wrapper">
          {hasImage ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="product-placeholder">
              {getPlaceholderEmoji(product.category?.name)}
            </span>
          )}
          {product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0 && (
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
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
