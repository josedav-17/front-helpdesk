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
    return this.http.post<any>(`${this.base}/api/auth/login`, { email, password }).pipe(
      map((resp) => {
        if (!resp?.access_token || !resp?.user) {
          this.logout();
          return false;
        }

        const userRole = (resp.user.rol || '').trim().toUpperCase();
        const allowedRoles = ['ADMIN', 'MESA', 'AREA', 'USUARIO'];

        if (!allowedRoles.includes(userRole)) {
          this.logout();
          return false;
        }

        if (this.isBrowser()) {
          localStorage.setItem(this.TOKEN_KEY, resp.access_token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(resp.user));
        }

        return true;
      }),
      catchError((error) => {
        console.error('ERROR LOGIN:', error);
        this.logout();
        return of(false);
      })
    );
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): any | null {
    if (!this.isBrowser()) return null;

    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}