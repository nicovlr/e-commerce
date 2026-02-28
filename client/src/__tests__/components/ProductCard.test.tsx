import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from '../../components/ProductCard';
import { renderWithProviders, mockProduct } from '../../test-helpers';

describe('ProductCard', () => {
  it('renders product name, price, and description', () => {
    const product = mockProduct();
    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText(/A test product description/)).toBeInTheDocument();
  });

  it('renders Add to Cart button when in stock', () => {
    const product = mockProduct({ stock: 10 });
    renderWithProviders(<ProductCard product={product} />);

    const button = screen.getByRole('button', { name: /add to cart/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders Sold Out button when out of stock', () => {
    const product = mockProduct({ stock: 0 });
    renderWithProviders(<ProductCard product={product} />);

    const button = screen.getByRole('button', { name: /sold out/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('shows Low Stock badge when stock is between 1 and 5', () => {
    const product = mockProduct({ stock: 3 });
    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('shows Out of Stock badge when stock is 0', () => {
    const product = mockProduct({ stock: 0 });
    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('does not show stock badge when stock is above 5', () => {
    const product = mockProduct({ stock: 50 });
    renderWithProviders(<ProductCard product={product} />);

    expect(screen.queryByText('Low Stock')).not.toBeInTheDocument();
    expect(screen.queryByText('Out of Stock')).not.toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDesc = 'A'.repeat(100);
    const product = mockProduct({ description: longDesc });
    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
  });

  it('links to product detail page', () => {
    const product = mockProduct({ id: 42 });
    renderWithProviders(<ProductCard product={product} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/42');
  });

  it('adds item to cart when button is clicked', () => {
    const product = mockProduct();
    renderWithProviders(<ProductCard product={product} />);

    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);
    // No error means cart context addItem was called successfully
  });
});
