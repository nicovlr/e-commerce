import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MetaTags from '../components/MetaTags';

const CartPage: React.FC = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

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
      <MetaTags title="Shopping Cart | ShopSmart" />
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <img
                  src={item.product.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}
                  alt={item.product.name}
                  className="cart-item-image"
                  loading="lazy"
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
                    aria-label={`Decrease quantity of ${item.product.name}`}
                  >
                    -
                  </button>
                  <span className="quantity-display" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.product.name}`}
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
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
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
