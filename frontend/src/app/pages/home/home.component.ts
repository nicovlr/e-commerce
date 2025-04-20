import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProductService } from '../../services/product.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="home-container">
      <section class="hero">
        <h1>Bienvenue sur notre boutique</h1>
        <p>Découvrez notre collection de vêtements tendance</p>
        <button mat-raised-button color="primary" routerLink="/products">
          Voir tous les produits
        </button>
      </section>

      <section class="new-products" *ngIf="!loading">
        <h2>Nouveautés</h2>
        <div class="products-grid">
          <mat-card class="product-card" *ngFor="let product of newProducts">
            <img mat-card-image [src]="product.imageUrl" [alt]="product.name">
            <mat-card-content>
              <p class="brand">{{ product.brand }}</p>
              <h3>{{ product.name }}</h3>
              <p class="price">{{ product.price | currency:'EUR' }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/products', product.id]">
                Voir détails
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <section class="sale-products" *ngIf="!loading">
        <h2>Promotions</h2>
        <div class="products-grid">
          <mat-card class="product-card" *ngFor="let product of saleProducts">
            <img mat-card-image [src]="product.imageUrl" [alt]="product.name">
            <mat-card-content>
              <p class="brand">{{ product.brand }}</p>
              <h3>{{ product.name }}</h3>
              <div class="price">
                <span class="original-price">{{ product.price | currency:'EUR' }}</span>
                <span class="sale-price">{{ product.salePrice | currency:'EUR' }}</span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/products', product.id]">
                Voir détails
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <div class="loading-container" *ngIf="loading">
        <app-loading-spinner></app-loading-spinner>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .hero {
      text-align: center;
      padding: 4rem 1rem;
      background: linear-gradient(to right, #f6f6f6, #ffffff);
      border-radius: 8px;
      margin-bottom: 3rem;

      h1 {
        font-size: 2.5rem;
        color: #333;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
      }

      button {
        padding: 0.75rem 2rem;
        font-size: 1.1rem;
      }
    }

    section {
      margin-bottom: 3rem;

      h2 {
        font-size: 2rem;
        color: #333;
        margin-bottom: 1.5rem;
        position: relative;
        padding-bottom: 0.5rem;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background-color: #3f51b5;
        }
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .product-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      img {
        height: 250px;
        object-fit: cover;
      }

      mat-card-content {
        flex-grow: 1;
        padding: 1rem;

        .brand {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        h3 {
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .price {
          font-size: 1.1rem;
          color: #2c5282;
          font-weight: bold;

          .original-price {
            text-decoration: line-through;
            color: #666;
            margin-right: 0.5rem;
            font-weight: normal;
          }

          .sale-price {
            color: #f44336;
          }
        }
      }

      mat-card-actions {
        padding: 1rem;
        margin-top: auto;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    @media (max-width: 768px) {
      .hero {
        padding: 2rem 1rem;

        h1 {
          font-size: 2rem;
        }

        p {
          font-size: 1rem;
        }
      }

      section h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  public newProducts: Product[] = [];
  public saleProducts: Product[] = [];
  public loading = true;

  constructor(private productService: ProductService) {}

  public ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    
    // Utiliser forkJoin pour gérer plusieurs observables en parallèle
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        newProducts: this.productService.getNewProducts(),
        saleProducts: this.productService.getSaleProducts()
      }).subscribe({
        next: (result) => {
          this.newProducts = result.newProducts;
          this.saleProducts = result.saleProducts;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
        }
      });
    });
  }
}
