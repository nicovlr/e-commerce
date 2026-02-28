import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart } from '../../context/CartContext';
import { Product } from '../../types';

const testProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  price: 19.99,
  stock: 10,
  image_url: '',
  category_id: 1,
};

const testProduct2: Product = {
  id: 2,
  name: 'Second Product',
  description: 'Another product',
  price: 9.99,
  stock: 5,
  image_url: '',
  category_id: 1,
};

const CartTestConsumer: React.FC = () => {
  const { items, itemCount, total, addItem, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="total">{total.toFixed(2)}</span>
      <span data-testid="items-length">{items.length}</span>
      <button onClick={() => addItem(testProduct)}>Add Product 1</button>
      <button onClick={() => addItem(testProduct2)}>Add Product 2</button>
      <button onClick={() => addItem(testProduct, 3)}>Add 3 of Product 1</button>
      <button onClick={() => removeItem(1)}>Remove Product 1</button>
      <button onClick={() => updateQuantity(1, 5)}>Set Qty 5</button>
      <button onClick={() => updateQuantity(1, 0)}>Set Qty 0</button>
      <button onClick={() => clearCart()}>Clear</button>
      {items.map((item) => (
        <div key={item.product.id} data-testid={`item-${item.product.id}`}>
          {item.product.name}: {item.quantity}
        </div>
      ))}
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty cart', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0.00');
    expect(screen.getByTestId('items-length').textContent).toBe('0');
  });

  it('adds item to cart', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('19.99');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product: 1');
  });

  it('increments quantity when adding existing item', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('2');
    expect(screen.getByTestId('items-length').textContent).toBe('1');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product: 2');
  });

  it('adds multiple different items', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Add Product 2'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('2');
    expect(screen.getByTestId('items-length').textContent).toBe('2');
    expect(screen.getByTestId('total').textContent).toBe('29.98');
  });

  it('adds item with custom quantity', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add 3 of Product 1'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('3');
    expect(screen.getByTestId('total').textContent).toBe('59.97');
  });

  it('removes item from cart', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Remove Product 1'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('items-length').textContent).toBe('0');
  });

  it('updates item quantity', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Set Qty 5'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('5');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product: 5');
  });

  it('removes item when quantity set to 0', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Set Qty 0'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('items-length').textContent).toBe('0');
  });

  it('clears all items', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Add Product 2'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Clear'));
    });

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('items-length').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0.00');
  });

  it('persists cart to localStorage', () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Add Product 1'));
    });

    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].product.name).toBe('Test Product');
    expect(saved[0].quantity).toBe(1);
  });

  it('loads cart from localStorage on mount', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([{ product: testProduct, quantity: 3 }])
    );

    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count').textContent).toBe('3');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Test Product: 3');
  });

  it('throws error when useCart is used outside CartProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<CartTestConsumer />);
    }).toThrow('useCart must be used within a CartProvider');

    consoleSpy.mockRestore();
  });
});
