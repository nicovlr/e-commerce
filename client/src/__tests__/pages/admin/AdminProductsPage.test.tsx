import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminProductsPage from '../../../pages/admin/AdminProductsPage';
import { renderWithProviders, mockProduct, mockCategory } from '../../../test-helpers';
import { productService } from '../../../services/productService';

jest.mock('../../../services/productService');
const mockedProductService = productService as jest.Mocked<typeof productService>;

describe('AdminProductsPage', () => {
  const products = [
    mockProduct({ id: 1, name: 'Widget A', price: 10, stock: 50, categoryId: 1 }),
    mockProduct({ id: 2, name: 'Widget B', price: 25, stock: 3, categoryId: 2 }),
  ];
  const categories = [
    mockCategory({ id: 1, name: 'Electronics' }),
    mockCategory({ id: 2, name: 'Books' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedProductService.getAll.mockResolvedValue({ data: products, meta: { page: 1, limit: 20, total: 2, totalPages: 1 } });
    mockedProductService.getCategories.mockResolvedValue(categories);
  });

  it('shows loading initially', () => {
    mockedProductService.getAll.mockReturnValue(new Promise(() => {}) as any);
    mockedProductService.getCategories.mockReturnValue(new Promise(() => {}) as any);
    renderWithProviders(<AdminProductsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders product table after loading', async () => {
    renderWithProviders(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
      expect(screen.getByText('Widget B')).toBeInTheDocument();
    });

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('displays product prices formatted', async () => {
    renderWithProviders(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('$10.00')).toBeInTheDocument();
      expect(screen.getByText('$25.00')).toBeInTheDocument();
    });
  });

  it('opens create modal on Add Product click', async () => {
    renderWithProviders(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Product'));

    expect(screen.getByText('Add Product', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText('Name', { selector: 'label' })).toBeInTheDocument();
  });

  it('opens edit modal with pre-filled data', async () => {
    renderWithProviders(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Widget A')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    mockedProductService.getAll.mockRejectedValue(new Error('fail'));
    mockedProductService.getCategories.mockRejectedValue(new Error('fail'));
    renderWithProviders(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });
  });
});
