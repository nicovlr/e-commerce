import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <div class="admin-container">
      <h1>Administration</h1>
      
      <div class="admin-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Produits</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Gérer les produits du catalogue</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/admin/products">
              Gérer les produits
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Commandes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Gérer les commandes clients</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/admin/orders">
              Voir les commandes
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Utilisateurs</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Gérer les utilisateurs</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/admin/users">
              Gérer les utilisateurs
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;

      h1 {
        margin-bottom: 2rem;
        color: #333;
      }
    }

    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;

      mat-card {
        height: 100%;

        mat-card-content {
          padding: 1rem 0;
        }

        mat-card-actions {
          padding: 1rem;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  `]
})
export class AdminComponent {} 