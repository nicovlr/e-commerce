import { screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsPage from '../../pages/ProductsPage';
import { renderWithProviders, mockProduct, mockCategory } from '../../test-helpers';
import { productService } from '../../services/productService';

jest.mock('../../services/productService');
jest.useFakeTimers();

const mockedProductService = productService as jest.Mocked<typeof productService>;

describe('ProductsPage', () => {
  const products = [
    mockProduct({ id: 1, name: 'Alpha Widget', price: 10, categoryId: 1 }),
    mockProduct({ id: 2, name: 'Beta Gadget', price: 50, categoryId: 2 }),
    mockProduct({ id: 3, name: 'Gamma Tool', price: 25, categoryId: 1 }),
  ];

  const categories = [
    mockCategory({ id: 1, name: 'Widgets' }),
    mockCategory({ id: 2, name: 'Gadgets' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedProductService.getAll.mockResolvedValue({ data: products, meta: { page: 1, limit: 12, total: products.length, totalPages: 1 } });
    mockedProductService.getCategories.mockResolvedValue(categories);
  });

  it('shows loading state initially', () => {
    mockedProductService.getAll.mockReturnValue(new Promise(() => {}) as any);
    mockedProductService.getCategories.mockReturnValue(new Promise(() => {}) as any);
    renderWithProviders(<ProductsPage />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Widget')).toBeInTheDocument();
      expect(screen.getByText('Beta Gadget')).toBeInTheDocument();
      expect(screen.getByText('Gamma Tool')).toBeInTheDocument();
    });
  });

  it('displays correct product count', async () => {
    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('3 products found')).toBeInTheDocument();
    });
  });

  it('sends search param to server on search', async () => {
    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Widget')).toBeInTheDocument();
    });

    const betaOnly = [mockProduct({ id: 2, name: 'Beta Gadget', price: 50, categoryId: 2 })];
    mockedProductService.getAll.mockResolvedValue({ data: betaOnly, meta: { page: 1, limit: 12, total: 1, totalPages: 1 } });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'Beta' } });

    // Advance past debounce delay
    await act(async () => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(mockedProductService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Beta' })
      );
    });
  });

  it('shows empty state when no products match filters', async () => {
    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Widget')).toBeInTheDocument();
    });

    mockedProductService.getAll.mockResolvedValue({ data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await act(async () => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(screen.getByText(/No products match your filters/)).toBeInTheDocument();
    });
  });

  it('shows error on fetch failure', async () => {
    mockedProductService.getAll.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load products.')).toBeInTheDocument();
    });
  });

  it('renders category filter dropdown', async () => {
    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      const categoryOptions = screen.getAllByRole('option');
      const categoryNames = categoryOptions.map((o) => o.textContent);
      expect(categoryNames).toContain('Widgets');
      expect(categoryNames).toContain('Gadgets');
    });
  });

  it('renders sort dropdown', async () => {
    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Widget')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Sort by Name')).toBeInTheDocument();
  });
});
