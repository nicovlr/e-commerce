import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminCategoriesPage from '../../../pages/admin/AdminCategoriesPage';
import { renderWithProviders, mockCategory } from '../../../test-helpers';
import { categoryService } from '../../../services/categoryService';

jest.mock('../../../services/categoryService');
const mockedCategoryService = categoryService as jest.Mocked<typeof categoryService>;

describe('AdminCategoriesPage', () => {
  const categories = [
    mockCategory({ id: 1, name: 'Electronics', description: 'Electronic devices' }),
    mockCategory({ id: 2, name: 'Books', description: 'Physical and digital books' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCategoryService.getAll.mockResolvedValue(categories);
  });

  it('shows loading initially', () => {
    mockedCategoryService.getAll.mockReturnValue(new Promise(() => {}) as any);
    renderWithProviders(<AdminCategoriesPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders categories table after loading', async () => {
    renderWithProviders(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Add Category')).toBeInTheDocument();
  });

  it('displays category descriptions', async () => {
    renderWithProviders(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Electronic devices')).toBeInTheDocument();
      expect(screen.getByText('Physical and digital books')).toBeInTheDocument();
    });
  });

  it('opens create modal on Add Category click', async () => {
    renderWithProviders(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Category'));

    expect(screen.getByText('Add Category', { selector: 'h2' })).toBeInTheDocument();
  });

  it('opens edit modal with pre-filled data', async () => {
    renderWithProviders(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    mockedCategoryService.getAll.mockRejectedValue(new Error('fail'));
    renderWithProviders(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
    });
  });
});
