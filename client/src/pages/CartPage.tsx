import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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

const CartPage: React.FC = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setPlacing(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await api.post('/orders', {
        items: orderItems,
      });

      clearCart();
      setOrderSuccess(true);
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container">
        <div className="order-success">
          <div className="order-success-icon">&#x2713;</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order is being processed.</p>
          <div className="order-success-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h1>Your Cart is Empty</h1>
          <p>Looks like you haven't added any items yet.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              const hasImage = item.product.image_url && item.product.image_url.trim() !== '';
              return (
                <div key={item.product.id} className="cart-item">
                  {hasImage ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="cart-item-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="cart-item-image-wrapper">
                      <span className="cart-item-placeholder">
                        {getPlaceholderEmoji(item.product.category?.name)}
                      </span>
                    </div>
                  )}
                  <div className="cart-item-info">
                    <Link to={`/products/${item.product.id}`} className="cart-item-name">
                      {item.product.name}
                    </Link>
                    <p className="cart-item-price">${Number(item.product.price).toFixed(2)} each</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                  <button
                    className="btn-ghost"
                    onClick={() => removeItem(item.product.id)}
                    title="Remove item"
                  >
                    &#x2715;
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn btn-primary btn-lg btn-block"
              disabled={placing}
            >
              {placing ? 'Placing Order...' : isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
