import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const persistCart = useCallback((cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, []);

  const addItem = useCallback(
    (product: Product, quantity: number = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updated = [...prev, { product, quantity }];
        }
        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  const removeItem = useCallback(
    (productId: number) => {
      setItems((prev) => {
        const updated = prev.filter((item) => item.product.id !== productId);
        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        persistCart(updated);
        return updated;
      });
    },
    [persistCart, removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
