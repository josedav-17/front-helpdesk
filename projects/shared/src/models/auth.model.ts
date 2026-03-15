export type UserRole = 'ADMIN' | 'MESA' | 'AREA' | 'USUARIO';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  area?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;   // ✅ antes estaba 'bearer'
  user: AuthUser;
}