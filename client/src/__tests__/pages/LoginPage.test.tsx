import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../pages/LoginPage';
import { renderWithProviders } from '../../test-helpers';

jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn().mockRejectedValue(new Error('Not authenticated')),
  },
}));

describe('LoginPage', () => {
  it('renders sign in form by default', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('does not show name field in login mode', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument();
  });

  it('toggles to registration form', () => {
    renderWithProviders(<LoginPage />);

    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(signUpButton);

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByText(/Create a new account/)).toBeInTheDocument();
  });

  it('toggles back to login form', () => {
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument();
  });

  it('has email input with correct type', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText('Email Address');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toBeRequired();
  });

  it('has password input with correct type and minLength', () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });

  it('allows typing in form fields', () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows "Don\'t have an account?" text in login mode', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
  });

  it('shows "Already have an account?" text in register mode', () => {
    renderWithProviders(<LoginPage />);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
  });
});
