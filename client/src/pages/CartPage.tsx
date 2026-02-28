import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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

      await api.post('/orders', { items: orderItems });

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
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order is being processed.</p>
          <div className="order-success-actions">
            <Link to="/products" className="btn btn-primary">
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
          <Link to="/products" className="btn btn-primary">
            Browse Products
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
            {items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <img
                  src={item.product.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}
                  alt={item.product.name}
                  className="cart-item-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
                <div className="cart-item-info">
                  <Link to={`/products/${item.product.id}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <p className="cart-item-price">${Number(item.product.price).toFixed(2)} each</p>
                </div>
                <div className="cart-item-quantity">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.product.id)}
                >
                  Remove
                </button>
              </div>
            ))}
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
              {placing ? 'Placing Order...' : isAuthenticated ? 'Place Order' : 'Login to Checkout'}
            </button>
            <button onClick={clearCart} className="btn btn-outline btn-block">
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
