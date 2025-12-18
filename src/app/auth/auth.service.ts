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
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // podrías mover esto a environment más adelante
  private readonly baseUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, data)
      .pipe(
        tap((res) => {
          // guarda el token donde prefieras
          localStorage.setItem('token', res.token);
        }),
      );
  }
}
