import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { Subscription } from 'rxjs';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
    MatSlideToggleModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') private sidenav!: MatSidenav;
  public title = 'E-Commerce';
  public cartItemCount = 0;
  private cartSubscription?: Subscription;
  isLoggedIn = false;
  isDemoMode = true;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private productService: ProductService
  ) {}

  public ngOnInit(): void {
    this.isDemoMode = this.productService.isDemoMode();
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.items.length;
    });
  }

  public ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  public logout(): void {
    this.authService.logout();
  }

  public toggleSidenav(): void {
    this.sidenav.toggle();
  }

  toggleDemoMode(useDemoMode: boolean) {
    this.isDemoMode = useDemoMode;
    this.productService.toggleDemoMode(useDemoMode);
    window.location.reload(); // Recharger la page pour appliquer le changement
  }
}
