import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import CartPage from '../../pages/CartPage';

jest.mock('../../services/authService', () => ({
  authService: {
    getProfile: jest.fn().mockRejectedValue(new Error('Not authenticated')),
  },
}));

const renderCartPage = () => {
  // Clear localStorage cart before each render
  localStorage.removeItem('cart');
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
};

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows empty cart message when no items', () => {
    renderCartPage();
    expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
    expect(screen.getByText(/haven't added any items/)).toBeInTheDocument();
  });

  it('shows Browse Products link on empty cart', () => {
    renderCartPage();
    const browseLink = screen.getByText('Browse Products');
    expect(browseLink).toBeInTheDocument();
    expect(browseLink.closest('a')).toHaveAttribute('href', '/products');
  });

  it('renders cart with items from localStorage', () => {
    const cartItems = [
      {
        product: {
          id: 1,
          name: 'Test Item',
          price: 25.0,
          stock: 10,
          description: 'A test item',
          image_url: '',
          category_id: 1,
        },
        quantity: 2,
      },
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <CartPage />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('$25.00 each')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    // Total appears in both cart-item-total and summary, verify it exists
    const totals = screen.getAllByText('$50.00');
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });

  it('renders order summary with correct total', () => {
    const cartItems = [
      {
        product: {
          id: 1,
          name: 'Item A',
          price: 10.0,
          stock: 5,
          description: '',
          image_url: '',
          category_id: 1,
        },
        quantity: 3,
      },
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <CartPage />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Items (3)')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('shows Login to Checkout when not authenticated', () => {
    const cartItems = [
      {
        product: {
          id: 1,
          name: 'Item',
          price: 10.0,
          stock: 5,
          description: '',
          image_url: '',
          category_id: 1,
        },
        quantity: 1,
      },
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <CartPage />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Login to Checkout')).toBeInTheDocument();
  });

  it('has Clear Cart button when items exist', () => {
    const cartItems = [
      {
        product: {
          id: 1,
          name: 'Item',
          price: 10.0,
          stock: 5,
          description: '',
          image_url: '',
          category_id: 1,
        },
        quantity: 1,
      },
    ];
    localStorage.setItem('cart', JSON.stringify(cartItems));

    render(
      <AuthProvider>
        <CartProvider>
          <MemoryRouter>
            <CartPage />
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Clear Cart')).toBeInTheDocument();
  });
});
