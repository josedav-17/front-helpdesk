import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, delay, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'admin_token';

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly logged$ = new BehaviorSubject<boolean>(this.hasToken());

  private safeGet(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  private safeSet(key: string, value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
  }

  private safeRemove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  private hasToken(): boolean {
    return !!this.safeGet(this.tokenKey);
  }

  login(user: string, pass: string) {
    const ok = user === 'admin' && pass === 'admin123';
    return of(ok).pipe(
      delay(300),
      tap((success) => {
        if (success) {
          this.safeSet(this.tokenKey, 'mock-token');
          this.logged$.next(true);
        }
      })
    );
  }

  logout() {
    this.safeRemove(this.tokenKey);
    this.logged$.next(false);
  }

  getToken() {
    return this.safeGet(this.tokenKey);
  }
}