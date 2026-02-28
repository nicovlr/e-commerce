import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../../components/Navbar';
import { renderWithProviders } from '../../test-helpers';

describe('Navbar', () => {
  it('renders brand name', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('ShopSmart')).toBeInTheDocument();
  });

  it('renders Home and Products links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders Cart link', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('Cart')).toBeInTheDocument();
  });

  it('renders Login button when not authenticated', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('does not show Dashboard or Orders links when not authenticated', () => {
    renderWithProviders(<Navbar />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Orders')).not.toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText('ShopSmart').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/products');
    expect(screen.getByText('Cart').closest('a')).toHaveAttribute('href', '/cart');
  });
});
