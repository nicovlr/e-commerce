import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';

import { CartService, CartItem, Cart } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    FormsModule,
    MatDividerModule
  ],
  template: `
    <div class="cart-container">
      <h1>Votre Panier</h1>
      
      <div *ngIf="cart.items.length > 0; else emptyCart">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of cart.items">
              <td class="product-cell">
                <img *ngIf="item.image" [src]="item.image" [alt]="item.name" class="product-image">
                <span class="product-name">{{ item.name }}</span>
              </td>
              <td>{{ item.price | currency:'EUR' }}</td>
              <td class="quantity-cell">
                <button mat-icon-button (click)="decrementQuantity(item)">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button mat-icon-button (click)="incrementQuantity(item)">
                  <mat-icon>add</mat-icon>
                </button>
              </td>
              <td>{{ (item.price * (item.quantity || 1)) | currency:'EUR' }}</td>
              <td>
                <button mat-icon-button color="warn" (click)="removeItem(item)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="cart-summary">
          <mat-divider></mat-divider>
          <div class="total-row">
            <span>Total:</span>
            <span class="total-price">{{ cart.total | currency:'EUR' }}</span>
          </div>
          
          <div class="cart-actions">
            <button mat-stroked-button routerLink="/products">
              <mat-icon>arrow_back</mat-icon>
              Continuer les achats
            </button>
            <button mat-raised-button color="warn" (click)="clearCart()">
              <mat-icon>remove_shopping_cart</mat-icon>
              Vider le panier
            </button>
            <button mat-raised-button color="primary" (click)="checkout()">
              <mat-icon>payment</mat-icon>
              Commander
            </button>
          </div>
        </div>
      </div>
      
      <ng-template #emptyCart>
        <div class="empty-cart">
          <mat-icon class="empty-cart-icon">shopping_cart</mat-icon>
          <p>Votre panier est vide</p>
          <button mat-raised-button color="primary" routerLink="/products">
            Découvrir nos produits
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;

      h1 {
        margin-bottom: 2rem;
        color: #333;
      }
    }

    .cart-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;

      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        color: #666;
        font-weight: 500;
      }

      .product-cell {
        display: flex;
        align-items: center;
        gap: 1rem;

        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-name {
          font-weight: 500;
        }
      }

      .quantity-cell {
        display: flex;
        align-items: center;

        .quantity {
          margin: 0 0.5rem;
          min-width: 2rem;
          text-align: center;
        }
      }
    }

    .cart-summary {
      background-color: #f9f9f9;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 2rem;

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1.5rem 0;
        font-size: 1.25rem;

        .total-price {
          font-weight: bold;
          color: #3f51b5;
          font-size: 1.5rem;
        }
      }
    }

    .cart-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
      gap: 1rem;

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .empty-cart {
      text-align: center;
      padding: 3rem;
      background-color: #f9f9f9;
      border-radius: 8px;

      .empty-cart-icon {
        font-size: 4rem;
        height: 4rem;
        width: 4rem;
        color: #ccc;
        margin-bottom: 1rem;
      }

      p {
        color: #666;
        margin-bottom: 1.5rem;
        font-size: 1.25rem;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  public cart: Cart = { items: [], total: 0 };

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }

  incrementQuantity(item: CartItem): void {
    if (item.quantity) {
      this.cartService.updateQuantity(item.id, item.quantity + 1);
      this.notificationService.info('Quantité mise à jour');
    }
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity && item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
      this.notificationService.info('Quantité mise à jour');
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id);
    this.notificationService.info('Article supprimé du panier');
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.notificationService.info('Panier vidé');
  }

  checkout(): void {
    // Cette fonction serait reliée à une API de paiement dans une application réelle
    this.notificationService.success('Commande confirmée!');
    this.cartService.clearCart();
    // Redirection vers une page de confirmation (à implémenter)
  }
}
