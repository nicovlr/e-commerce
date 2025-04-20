import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { Product, Size } from '../../models/product.interface';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="product-detail-container" *ngIf="!loading && product">
      <div class="product-images">
        <img [src]="product.imageUrl" [alt]="product.name" class="main-image">
      </div>

      <div class="product-info">
        <div class="product-header">
          <span class="brand">{{ product.brand }}</span>
          <h1>{{ product.name }}</h1>
          
          <div class="badges">
            <span class="badge new" *ngIf="product.isNew">Nouveau</span>
            <span class="badge sale" *ngIf="product.isOnSale">Promo</span>
          </div>

          <div class="price" [class.on-sale]="product.isOnSale">
            <span class="original-price" [class.strikethrough]="product.isOnSale">
              {{ product.price | currency:'EUR' }}
            </span>
            <span class="sale-price" *ngIf="product.isOnSale">
              {{ product.salePrice | currency:'EUR' }}
            </span>
          </div>
        </div>

        <div class="product-selection">
          <div class="color-selection">
            <label>Couleur :</label>
            <mat-select [(ngModel)]="selectedColor" required>
              <mat-option *ngFor="let color of product.colors" [value]="color">
                {{ color }}
              </mat-option>
            </mat-select>
          </div>

          <div class="size-selection">
            <label>Taille :</label>
            <mat-select [(ngModel)]="selectedSize" required>
              <mat-option *ngFor="let size of product.sizes" 
                         [value]="size"
                         [disabled]="size.stock === 0">
                {{ size.name }} {{ size.stock === 0 ? '(Rupture)' : '' }}
              </mat-option>
            </mat-select>
          </div>

          <button mat-raised-button 
                  color="primary" 
                  class="add-to-cart-btn"
                  [disabled]="!canAddToCart()"
                  (click)="addToCart()">
            <mat-icon>shopping_cart</mat-icon>
            {{ getAddToCartButtonText() }}
          </button>
        </div>

        <mat-tab-group>
          <mat-tab label="Description">
            <div class="tab-content">
              <p>{{ product.description }}</p>
              <h3>Caractéristiques :</h3>
              <ul>
                <li><strong>Matière :</strong> {{ product.material }}</li>
                <li><strong>Genre :</strong> {{ product.gender }}</li>
                <li><strong>Catégorie :</strong> {{ product.category }}</li>
              </ul>
            </div>
          </mat-tab>
          <mat-tab label="Livraison">
            <div class="tab-content">
              <h3>Options de livraison</h3>
              <ul>
                <li>Livraison standard (2-4 jours ouvrés) : Gratuite</li>
                <li>Livraison express (24h) : 9,99€</li>
                <li>Click & Collect : Gratuit</li>
              </ul>
              <p>Retours gratuits sous 30 jours</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <div class="loading-container" *ngIf="loading">
      <app-loading-spinner></app-loading-spinner>
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .product-images {
      .main-image {
        width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .product-info {
      .product-header {
        margin-bottom: 2rem;

        .brand {
          color: #666;
          font-size: 1.1rem;
        }

        h1 {
          margin: 0.5rem 0;
          font-size: 2rem;
          color: #333;
        }
      }

      .badges {
        display: flex;
        gap: 0.5rem;
        margin: 1rem 0;

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          
          &.new {
            background-color: #4CAF50;
            color: white;
          }
          
          &.sale {
            background-color: #f44336;
            color: white;
          }
        }
      }

      .price {
        font-size: 1.5rem;
        margin: 1rem 0;
        
        &.on-sale {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .strikethrough {
          text-decoration: line-through;
          color: #666;
          font-size: 1.25rem;
        }

        .sale-price {
          color: #f44336;
          font-weight: bold;
        }
      }
    }

    .product-selection {
      margin: 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .color-selection,
      .size-selection {
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }
      }

      .add-to-cart-btn {
        margin-top: 1rem;
        padding: 1rem;
        font-size: 1.1rem;

        mat-icon {
          margin-right: 0.5rem;
        }
      }
    }

    .tab-content {
      padding: 1rem;

      h3 {
        color: #333;
        margin: 1rem 0;
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          margin: 0.5rem 0;
          color: #666;

          strong {
            color: #333;
          }
        }
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .product-detail-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  public product: Product | null = null;
  public loading = true;
  public selectedColor: string = '';
  public selectedSize: string = '';
  public quantity: number = 1;
  public relatedProducts: Product[] = [];
  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const productId = Number(params['id']);
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  public ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.updateSelections(product);
        }
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  private updateSelections(product: Product): void {
    if (product.colors && product.colors.length > 0) {
      this.selectedColor = product.colors[0];
    }
    
    const availableSize = this.getFirstAvailableSize(product);
    if (availableSize) {
      this.selectedSize = availableSize.name;
    }
  }
  
  private getFirstAvailableSize(product: Product): Size | undefined {
    if (!product.sizes || product.sizes.length === 0) {
      return undefined;
    }
    return product.sizes.find(size => size.stock > 0);
  }

  public canAddToCart(): boolean {
    return !!(this.selectedColor && this.selectedSize && this.selectedSize.stock > 0);
  }

  public getAddToCartButtonText(): string {
    if (!this.selectedColor || !this.selectedSize) {
      return 'Sélectionnez une couleur et une taille';
    }
    if (this.selectedSize.stock === 0) {
      return 'Rupture de stock';
    }
    return 'Ajouter au panier';
  }

  public addToCart(): void {
    if (!this.product || !this.canAddToCart()) {
      return;
    }

    const cartItem = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.isOnSale ? (this.product.salePrice || this.product.price) : this.product.price,
      image: this.product.imageUrl || this.product.image_url,
      quantity: this.quantity
    };
    
    this.cartService.addToCart(cartItem);
    this.notificationService.success(`${this.product.name} ajouté au panier`);
  }
} 