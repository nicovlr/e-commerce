import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Product, Category } from './types';

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Test Product',
  description: 'A test product description',
  price: 29.99,
  stock: 50,
  imageUrl: 'https://example.com/image.jpg',
  categoryId: 1,
  category: { id: 1, name: 'Electronics' },
  ...overrides,
});

export const mockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Electronics',
  description: 'Electronic devices',
  ...overrides,
});
