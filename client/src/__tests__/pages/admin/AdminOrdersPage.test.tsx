import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminOrdersPage from '../../../pages/admin/AdminOrdersPage';
import { renderWithProviders } from '../../../test-helpers';
import { orderService } from '../../../services/orderService';
import { Order } from '../../../types';

jest.mock('../../../services/orderService');
const mockedOrderService = orderService as jest.Mocked<typeof orderService>;

const mockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  userId: 1,
  status: 'pending',
  totalAmount: 99.99,
  items: [{ id: 1, orderId: 1, productId: 1, quantity: 2, price: 49.99 }],
  createdAt: '2025-01-15T10:00:00Z',
  ...overrides,
});

describe('AdminOrdersPage', () => {
  const orders = [
    mockOrder({ id: 1, status: 'pending', totalAmount: 99.99 }),
    mockOrder({ id: 2, status: 'shipped', totalAmount: 150.0 }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedOrderService.getAll.mockResolvedValue({ data: orders, meta: { page: 1, limit: 20, total: 2, totalPages: 1 } });
  });

  it('shows loading initially', () => {
    mockedOrderService.getAll.mockReturnValue(new Promise(() => {}) as any);
    renderWithProviders(<AdminOrdersPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders orders table after loading', async () => {
    renderWithProviders(<AdminOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });

    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('displays order totals', async () => {
    renderWithProviders(<AdminOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });
  });

  it('renders status badges', async () => {
    const { container } = renderWithProviders(<AdminOrdersPage />);

    await waitFor(() => {
      const badges = container.querySelectorAll('.status-badge');
      expect(badges.length).toBe(2);
    });
  });

  it('renders status change dropdowns', async () => {
    renderWithProviders(<AdminOrdersPage />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBe(2);
    });
  });

  it('shows error on fetch failure', async () => {
    mockedOrderService.getAll.mockRejectedValue(new Error('fail'));
    renderWithProviders(<AdminOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load orders')).toBeInTheDocument();
    });
  });
});
