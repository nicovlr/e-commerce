import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productService.getById(Number(id));
        setProduct(data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || 'Product not found.'}</div>
        <button onClick={() => navigate('/products')} className="btn btn-outline">
          Back to Products
        </button>
      </div>
    );
  }

  const imageUrl = product.imageUrl || 'https://via.placeholder.com/500x400?text=No+Image';

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate('/products')} className="btn btn-outline back-btn">
          &larr; Back to Products
        </button>

        <div className="product-detail">
          <div className="product-detail-image">
            <img
              src={imageUrl}
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/500x400?text=No+Image';
              }}
            />
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>

            {product.category && (
              <span className="category-tag">{product.category.name}</span>
            )}

            <p className="product-detail-price">${Number(product.price).toFixed(2)}</p>

            <div className="stock-info">
              {product.stock > 10 && (
                <span className="stock-status in-stock">In Stock ({product.stock} available)</span>
              )}
              {product.stock > 0 && product.stock <= 10 && (
                <span className="stock-status low-stock">
                  Low Stock - Only {product.stock} left!
                </span>
              )}
              {product.stock === 0 && (
                <span className="stock-status out-of-stock">Out of Stock</span>
              )}
            </div>

            <p className="product-detail-description">{product.description}</p>

            {product.stock > 0 && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`btn btn-lg ${addedToCart ? 'btn-success' : 'btn-primary'}`}
                >
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
