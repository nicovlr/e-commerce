import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Connexion</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom d'utilisateur</mat-label>
              <input matInput [(ngModel)]="username" name="username" required>
              <mat-icon matSuffix>account_circle</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" required>
              <button type="button" mat-icon-button matSuffix (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading || !loginForm.form.valid">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Se connecter</span>
              </button>
            </div>
          </form>
          
          <div class="demo-accounts">
            <p><strong>Comptes de démonstration :</strong></p>
            <ul>
              <li><strong>Admin :</strong> admin / admin</li>
              <li><strong>Utilisateur :</strong> user / user</li>
            </ul>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 4rem auto;
      padding: 0 1rem;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
      
      button {
        min-width: 120px;
        
        mat-spinner {
          display: inline-block;
          margin: 0 auto;
        }
      }
    }
    
    .demo-accounts {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      
      p {
        color: #666;
      }
      
      ul {
        padding-left: 1.5rem;
        
        li {
          margin-bottom: 0.5rem;
        }
      }
    }
  `]
})
export class LoginComponent {
  public username = '';
  public password = '';
  public hidePassword = true;
  public isLoading = false;
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private notification: NotificationService
  ) {}
  
  public onSubmit(): void {
    if (!this.username || !this.password) {
      return;
    }
    
    this.isLoading = true;
    
    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.notification.success('Connexion réussie');
          if (this.username === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.notification.error('Identifiants incorrects');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notification.error('Erreur de connexion');
        console.error('Login error:', error);
      }
    });
  }
} 