import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const imageUrl = product.image_url || 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-wrapper">
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
          {product.stock <= 5 && product.stock > 0 && (
            <span className="stock-badge low-stock">Low Stock</span>
          )}
          {product.stock === 0 && <span className="stock-badge out-of-stock">Out of Stock</span>}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">
            {product.description?.substring(0, 80)}
            {product.description && product.description.length > 80 ? '...' : ''}
          </p>
          <div className="product-footer">
            <span className="product-price">${product.price.toFixed(2)}</span>
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
