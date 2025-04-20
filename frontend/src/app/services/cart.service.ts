import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [], total: 0 });
  public cart$ = this.cartSubject.asObservable();

  constructor(private notificationService: NotificationService) {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartSubject.next(JSON.parse(savedCart));
    }
  }

  private saveCart(cart: Cart): void {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  public getCart(): Cart {
    return this.cartSubject.value;
  }

  public addToCart(item: CartItem): void {
    const currentCart = this.getCart();
    const existingItem = currentCart.items.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      currentCart.items.push({ ...item, quantity: 1 });
    }

    currentCart.total = this.calculateTotal(currentCart.items);
    
    this.saveCart(currentCart);
  }

  public removeFromCart(itemId: number): void {
    const currentCart = this.getCart();
    const updatedItems = currentCart.items.filter(item => item.id !== itemId);
    
    const updatedCart: Cart = {
      items: updatedItems,
      total: this.calculateTotal(updatedItems)
    };
    
    this.saveCart(updatedCart);
  }

  public updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }
    
    const currentCart = this.getCart();
    const item = currentCart.items.find(i => i.id === itemId);
    
    if (item) {
      item.quantity = quantity;
      currentCart.total = this.calculateTotal(currentCart.items);
      this.saveCart(currentCart);
    }
  }

  public clearCart(): void {
    this.saveCart({ items: [], total: 0 });
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  }
}

