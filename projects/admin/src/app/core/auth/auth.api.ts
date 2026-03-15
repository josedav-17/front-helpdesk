import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { LoginResponse } from '../../../../../shared/src/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/api/auth/login`, { email, password });
  }
}