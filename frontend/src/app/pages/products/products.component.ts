import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { CartService, CartItem } from '../../services/cart.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { Product, Size } from '../../models/product.interface';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatDialogModule,
    FormsModule,
    RouterModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="products-container">
      <div class="filters">
        <mat-form-field class="search-field">
          <mat-label>Rechercher des produits</mat-label>
          <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Genre</mat-label>
          <mat-select [(ngModel)]="selectedGender" (selectionChange)="filterProducts()">
            <mat-option value="">Tous</mat-option>
            <mat-option value="homme">Homme</mat-option>
            <mat-option value="femme">Femme</mat-option>
            <mat-option value="unisexe">Unisexe</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Catégorie</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="filterProducts()">
            <mat-option value="">Toutes</mat-option>
            <mat-option *ngFor="let category of categories" [value]="category">
              {{ category }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="active-filters" *ngIf="hasActiveFilters()">
        <mat-chip-listbox>
          <mat-chip *ngIf="selectedGender" (removed)="removeGenderFilter()">
            {{ selectedGender }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
          <mat-chip *ngIf="selectedCategory" (removed)="removeCategoryFilter()">
            {{ selectedCategory }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
          <mat-chip *ngIf="searchQuery" (removed)="removeSearchFilter()">
            "{{ searchQuery }}"
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
        </mat-chip-listbox>
      </div>

      <div *ngIf="loading" class="products-grid">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <div *ngIf="!loading" class="products-grid">
        <mat-card class="product-card" *ngFor="let product of products">
          <div class="product-badges">
            <span class="badge new" *ngIf="product.isNew">Nouveau</span>
            <span class="badge sale" *ngIf="product.isOnSale">Promo</span>
          </div>
          
          <img [src]="product.imageUrl" [alt]="product.name">
          
          <div class="product-info">
            <span class="brand">{{ product.brand }}</span>
            <h3>{{ product.name }}</h3>
            
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

          <div class="product-colors">
            <span class="color-label">Couleurs :</span>
            <div class="color-dots">
              <span class="color-dot" 
                    *ngFor="let color of product.colors"
                    [title]="color">•</span>
            </div>
          </div>

          <div class="product-sizes">
            <span class="size-label">Tailles disponibles :</span>
            <div class="size-chips">
              <span class="size-chip" 
                    *ngFor="let size of product.sizes"
                    [class.out-of-stock]="size.stock === 0">
                {{ size.name }}
              </span>
            </div>
          </div>

          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/products', product.id]">
              Voir détails
            </button>
            <button mat-raised-button color="accent" 
                    (click)="addToCart(product)"
                    [disabled]="!hasAvailableStock(product)">
              <mat-icon>add_shopping_cart</mat-icon>
              {{ getCartButtonText(product) }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .active-filters {
      margin-bottom: 1rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .product-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      img {
        height: 300px;
        object-fit: cover;
      }
    }

    .product-badges {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      gap: 0.5rem;
      z-index: 1;

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

    .product-brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .product-description {
      color: #666;
      margin: 0.5rem 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .product-price {
      margin: 1rem 0;
      font-size: 1.25rem;
      
      &.on-sale {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .strikethrough {
        text-decoration: line-through;
        color: #666;
        font-size: 1rem;
      }

      .sale-price {
        color: #f44336;
        font-weight: bold;
      }
    }

    .product-colors {
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .color-label {
        font-size: 0.9rem;
        color: #666;
      }

      .color-dots {
        display: flex;
        gap: 0.25rem;
      }

      .color-dot {
        font-size: 1.5rem;
        line-height: 1;
        cursor: help;
      }
    }

    .product-sizes {
      margin: 0.5rem 0;

      .size-label {
        font-size: 0.9rem;
        color: #666;
        display: block;
        margin-bottom: 0.25rem;
      }

      .size-chips {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .size-chip {
        padding: 0.25rem 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.875rem;

        &.out-of-stock {
          color: #999;
          text-decoration: line-through;
        }
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      margin-top: auto;
    }

    @media (max-width: 768px) {
      .products-container {
        padding: 1rem;
      }

      .filters {
        flex-direction: column;
      }

      .search-field {
        width: 100%;
      }
    }
  `]
})
export class ProductsComponent implements OnInit, OnDestroy {
  public products: Product[] = [];
  public loading = true;
  public searchQuery = '';
  public selectedGender = '';
  public selectedCategory = '';
  public categories: string[] = [];
  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    this.loadProducts();
  }

  public ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.categories = [...new Set(products.map(p => p.category))];
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  public filterProducts(): void {
    this.loading = true;
    let filteredProducts = this.productService.getProducts();

    if (this.selectedGender) {
      filteredProducts = this.productService.getProductsByGender(this.selectedGender as 'homme' | 'femme' | 'unisexe');
    }

    if (this.selectedCategory) {
      filteredProducts = this.productService.getProductsByCategory(this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      filteredProducts = this.productService.searchProducts(this.searchQuery);
    }

    filteredProducts.subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error filtering products:', error);
        this.loading = false;
      }
    });
  }

  public onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.filterProducts();
    }, 300);
  }

  public addToCart(product: Product): void {
    if (!this.hasAvailableStock(product)) {
      this.notificationService.error('Désolé, ce produit n\'est plus en stock');
      return;
    }
    
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.isOnSale ? (product.salePrice || product.price) : product.price,
      image: product.imageUrl || product.image_url
    };
    
    this.cartService.addToCart(cartItem);
    this.notificationService.success('Produit ajouté au panier');
  }

  public hasAvailableStock(product: Product): boolean {
    if (product.stock && product.stock > 0) {
      return true;
    }
    
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.some(size => size.stock > 0);
    }
    
    return false;
  }

  public getCartButtonText(product: Product): string {
    return this.hasAvailableStock(product) ? 'Ajouter au panier' : 'Rupture de stock';
  }

  public hasActiveFilters(): boolean {
    return !!(this.selectedGender || this.selectedCategory || this.searchQuery);
  }

  public removeGenderFilter(): void {
    this.selectedGender = '';
    this.filterProducts();
  }

  public removeCategoryFilter(): void {
    this.selectedCategory = '';
    this.filterProducts();
  }

  public removeSearchFilter(): void {
    this.searchQuery = '';
    this.filterProducts();
  }
}
