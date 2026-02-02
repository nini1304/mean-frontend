import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  correo: string;
  contrasena: string;
}

interface LoginResponse {
  message: string;
  token: string;
  requiereCambioContrasena?: boolean;
}

export interface UserTokenPayload {
  sub: string;
  nombre_completo: string;
  correo: string;
  rol?: {
    id: string;
    nombre: string;
  };
  requiereCambioContrasena?: boolean;
  iat: number;
  exp: number;
}

interface ForgotPasswordResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = '/api/auth';

  constructor(private http: HttpClient) { }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
  }


  forgotPassword(correo: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${this.baseUrl}/forgot-password`,
      { correo }
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getTokenPayload(token: string): UserTokenPayload | null {
    try {
      const payloadBase64 = token.split('.')[1];

      // JWT usa base64url, lo normalizamos a base64 estándar
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json) as UserTokenPayload;
    } catch (e) {
      console.error('No se pudo decodificar el token', e);
      return null;
    }
  }

  changePassword(contrasena_actual: string, contrasena_nueva: string) {
    return this.http.post<{ message: string }>(
      `http://localhost:3000/api/contrasenas/change-password`,
      { contrasena_actual, contrasena_nueva }
    );
  }

}
