import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private base = environment.apiBase;

  private readonly TOKEN_KEY = 'admin_token';
  private readonly USER_KEY = 'admin_user';

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(`${this.base}/api/auth/login`, { email, password })
      .pipe(
        map((resp) => {
          if (!resp?.access_token || resp?.user?.rol !== 'ADMIN') {
            this.logout();
            return false;
          }

          if (this.isBrowser()) {
            localStorage.setItem(this.TOKEN_KEY, resp.access_token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(resp.user));
          }

          return true;
        }),
        catchError(() => of(false))
      );
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}