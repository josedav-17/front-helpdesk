import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

export type UserRole = 'ADMIN' | 'MESA' | 'AREA' | 'USUARIO';

export interface UserDto {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  area?: string | null;
  telefono?: string | null;
  is_active: boolean;
}

export interface UserCreatePayload {
  email: string;
  nombre: string;
  password: string;
  rol: UserRole;
  area?: string | null;
  telefono?: string | null;
}

export interface UserUpdatePayload {
  email?: string;
  nombre?: string;
  password?: string;
  rol?: UserRole;
  area?: string | null;
  telefono?: string | null;
  is_active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  private base = environment.apiBase;


  listUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.base}/api/auth/users`);
  }

  createUser(payload: UserCreatePayload): Observable<{ message: string; id: string }> {
    return this.http.post<{ message: string; id: string }>(`${this.base}/api/auth/users`, payload);
  }

  updateUser(userId: string, payload: UserUpdatePayload): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.base}/api/auth/users/${userId}`, payload);
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/api/auth/users/${userId}`);
  }
}