import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Mode demo: true pour utiliser le mode démo, false pour utiliser le backend réel
  private useDemoMode = false;

  constructor(private http: HttpClient) {
    // Charger l'utilisateur depuis le localStorage au démarrage
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userJson = localStorage.getItem(this.userKey);
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        // En cas d'erreur, supprimer les données corrompues
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
      }
    }
  }

  login(username: string, password: string): Observable<boolean> {
    // Mode démo
    if (this.useDemoMode) {
      return of(true).pipe(
        delay(800), // Simuler un délai réseau
        tap(() => {
          // Vérification simplifiée pour la démo
          if ((username === 'admin' && password === 'admin') || 
              (username === 'user' && password === 'user')) {
            
            // Créer un token mock
            const token = `demo-token-${Date.now()}`;
            localStorage.setItem(this.tokenKey, token);
            
            // Créer un utilisateur mock
            const user: User = {
              id: username === 'admin' ? 1 : 2,
              username: username,
              email: `${username}@example.com`,
              is_admin: username === 'admin'
            };
            
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
            return true;
          } else {
            return false;
          }
        }),
        map(() => {
          return !!this.currentUserSubject.value;
        })
      );
    }
    
    // Mode API réelle
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post<AuthResponse>(`${environment.authUrl}/token`, formData)
      .pipe(
        tap(response => {
          if (response.access_token) {
            localStorage.setItem(this.tokenKey, response.access_token);
            
            // En l'absence d'un endpoint /me, on simule l'utilisateur
            const user: User = {
              id: 1,
              username: username,
              email: `${username}@example.com`,
              is_admin: username === 'admin'
            };
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        map(response => !!response.access_token),
        catchError(error => {
          console.error('Erreur de connexion:', error);
          return of(false);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.is_admin;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
