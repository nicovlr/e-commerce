import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../../pages/HomePage';
import { renderWithProviders, mockProduct } from '../../test-helpers';
import { productService } from '../../services/productService';

jest.mock('../../services/productService');

const mockedProductService = productService as jest.Mocked<typeof productService>;

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero section', async () => {
    mockedProductService.getAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 6, total: 0, totalPages: 0 } });
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Welcome to ShopSmart')).toBeInTheDocument();
    expect(screen.getByText('Browse Products')).toBeInTheDocument();
    expect(screen.getByText('AI Dashboard')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    mockedProductService.getAll.mockReturnValue(new Promise(() => {}) as any);
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('renders featured products after loading', async () => {
    const products = [
      mockProduct({ id: 1, name: 'Product A' }),
      mockProduct({ id: 2, name: 'Product B' }),
    ];
    mockedProductService.getAll.mockResolvedValue({ data: products, meta: { page: 1, limit: 6, total: 2, totalPages: 1 } });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    mockedProductService.getAll.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load products. Please try again later.')
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no products', async () => {
    mockedProductService.getAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 6, total: 0, totalPages: 0 } });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/No products available yet/)).toBeInTheDocument();
    });
  });

  it('renders features section', async () => {
    mockedProductService.getAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 6, total: 0, totalPages: 0 } });
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Why ShopSmart?')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument();
    expect(screen.getByText('Easy Shopping')).toBeInTheDocument();
    expect(screen.getByText('Stock Alerts')).toBeInTheDocument();
  });

  it('limits featured products to 6', async () => {
    const products = Array.from({ length: 10 }, (_, i) =>
      mockProduct({ id: i + 1, name: `Product ${i + 1}` })
    );
    mockedProductService.getAll.mockResolvedValue({ data: products.slice(0, 6), meta: { page: 1, limit: 6, total: 10, totalPages: 2 } });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 6')).toBeInTheDocument();
      expect(screen.queryByText('Product 7')).not.toBeInTheDocument();
    });
  });
});
