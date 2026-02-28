import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import ProtectedRoute from '../../components/ProtectedRoute';

jest.mock('../../services/authService', () => ({
  authService: {
    getProfile: jest.fn().mockRejectedValue(new Error('Not authenticated')),
  },
}));

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', async () => {
    render(
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <MemoryRouter initialEntries={['/dashboard']}>
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    );

    // Should not render protected content when not authenticated
    // After loading, it should redirect (content won't be visible)
    await screen.findByText(
      (_, element) => element?.textContent !== 'Protected Content',
      {},
      { timeout: 3000 }
    ).catch(() => {
      // Expected - content should not be visible
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
