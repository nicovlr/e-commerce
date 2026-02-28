import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { ShippingAddress } from '../types';
import MetaTags from '../components/MetaTags';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1e293b',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#dc2626' },
  },
};

const emptyAddress: ShippingAddress = {
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

type Step = 'shipping' | 'payment' | 'confirmation';

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  const [step, setStep] = useState<Step>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(emptyAddress);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isAddressValid = () => {
    return Object.values(shippingAddress).every((v) => v.trim() !== '');
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddressValid()) {
      setError(null);
      setStep('payment');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const { clientSecret, orderId: newOrderId } = await orderService.checkout(
        orderItems,
        shippingAddress,
      );
      setOrderId(newOrderId);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card element not found');
        setProcessing(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            },
          },
        },
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        clearCart();
        setStep('confirmation');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  if (step === 'confirmation') {
    return (
      <div className="checkout-page">
        <MetaTags title="Order Confirmed | ShopSmart" />
        <div className="container">
          <div className="checkout-confirmation">
            <div className="confirmation-icon">&#10003;</div>
            <h1>Payment Successful!</h1>
            <p>Your order #{orderId} has been placed and payment confirmed.</p>
            <div className="confirmation-details">
              <h3>Shipping to:</h3>
              <p>
                {shippingAddress.firstName} {shippingAddress.lastName}<br />
                {shippingAddress.address}<br />
                {shippingAddress.city}, {shippingAddress.postalCode}<br />
                {shippingAddress.country}
              </p>
            </div>
            <div className="order-success-actions">
              <Link to="/orders" className="btn btn-primary">
                View My Orders
              </Link>
              <Link to="/products" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <MetaTags title="Checkout | ShopSmart" />
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-steps">
          <div className={`checkout-step ${step === 'shipping' ? 'active' : 'completed'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Shipping</span>
          </div>
          <div className="checkout-step-divider" />
          <div className={`checkout-step ${step === 'payment' ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Payment</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="checkout-layout">
          <div className="checkout-form-section">
            {step === 'shipping' && (
              <form onSubmit={handleContinueToPayment}>
                <h2>Shipping Address</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      className="input"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleAddressChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      className="input"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleAddressChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    type="text"
                    className="input"
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      className="input"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                      id="postalCode"
                      type="text"
                      className="input"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    type="text"
                    className="input"
                    value={shippingAddress.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePayment}>
                <h2>Payment Details</h2>
                <div className="shipping-summary">
                  <p className="shipping-summary-label">Shipping to:</p>
                  <p>
                    {shippingAddress.firstName} {shippingAddress.lastName},{' '}
                    {shippingAddress.address}, {shippingAddress.city},{' '}
                    {shippingAddress.postalCode}, {shippingAddress.country}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setStep('shipping')}
                  >
                    Edit
                  </button>
                </div>
                <div className="card-element-wrapper">
                  <label>Card Information</label>
                  <div className="card-element-container">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={!stripe || processing}
                >
                  {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </button>
              </form>
            )}
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.product.id} className="checkout-item">
                  <span className="checkout-item-name">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="checkout-item-price">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <hr />
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  const options = useMemo(() => ({ locale: 'en' as const }), []);

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;
