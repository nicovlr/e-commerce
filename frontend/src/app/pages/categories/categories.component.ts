import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { CategoryService } from '../../services/category.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="categories-container">
      <h1>Nos Catégories</h1>
      
      <div *ngIf="loading" class="categories-grid">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <div *ngIf="!loading" class="categories-grid">
        <mat-card 
          *ngFor="let category of categories" 
          class="category-card"
          matRipple
          [routerLink]="['/products']"
          [queryParams]="{ category: category.id }">
          <div class="category-image">
            <img [src]="category.imageUrl" [alt]="category.name">
            <div class="category-overlay">
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </div>
          <mat-card-content>
            <h2>{{ category.name }}</h2>
            <p>{{ category.description }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">
              Explorer
              <mat-icon>chevron_right</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .categories-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;

      h1 {
        font-size: 2.5rem;
        color: #333;
        margin-bottom: 2rem;
        text-align: center;
      }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .category-card {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

        .category-overlay {
          opacity: 1;
        }

        .category-image img {
          transform: scale(1.1);
        }
      }

      .category-image {
        position: relative;
        height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .category-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;

          mat-icon {
            color: white;
            font-size: 2rem;
            height: 2rem;
            width: 2rem;
          }
        }
      }

      mat-card-content {
        padding: 1.5rem;

        h2 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        p {
          color: #666;
          line-height: 1.5;
        }
      }

      mat-card-actions {
        padding: 0 1rem 1rem;
        display: flex;
        justify-content: flex-end;

        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      .categories-container {
        padding: 1rem;

        h1 {
          font-size: 2rem;
        }
      }

      .categories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }
}
