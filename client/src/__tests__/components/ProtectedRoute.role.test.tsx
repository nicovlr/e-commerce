import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';
import ProtectedRoute from '../../components/ProtectedRoute';

const mockAdmin = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' };
const mockCustomer = { id: 2, name: 'Customer', email: 'customer@test.com', role: 'customer' };

const renderWithAuth = (user: typeof mockAdmin | null, requiredRole?: 'admin') => {
  // Mock authService to return the given user
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
    if (key === 'token') return user ? 'fake-token' : null;
    if (key === 'user') return user ? JSON.stringify(user) : null;
    return null;
  });

  return render(
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={['/admin']}>
              <Routes>
                <Route path="/" element={<div>Home Page</div>} />
                <Route path="/login" element={<div>Login Page</div>} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole={requiredRole}>
                      <div>Admin Content</div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

// Mock authService.getProfile
jest.mock('../../services/authService', () => ({
  authService: {
    getProfile: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authService } = require('../../services/authService');

describe('ProtectedRoute with requiredRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows admin access when requiredRole is admin', async () => {
    authService.getProfile.mockResolvedValue(mockAdmin);
    renderWithAuth(mockAdmin, 'admin');

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('redirects non-admin to home when requiredRole is admin', async () => {
    authService.getProfile.mockResolvedValue(mockCustomer);
    renderWithAuth(mockCustomer, 'admin');

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', async () => {
    authService.getProfile.mockRejectedValue(new Error('Not authenticated'));
    renderWithAuth(null, 'admin');

    await waitFor(() => {
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  it('allows any authenticated user when no requiredRole', async () => {
    authService.getProfile.mockResolvedValue(mockCustomer);
    renderWithAuth(mockCustomer);

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
});
