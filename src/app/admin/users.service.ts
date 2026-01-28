import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RolDto {
  _id: string;
  nombre: string;
}

export interface UsuarioDto {
  _id: string;
  nombre_completo: string;
  correo: string;
  numero_celular: string;
  id_rol: RolDto;
  eliminado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearUsuarioDto {
  nombre_completo: string;
  correo: string;
  numero_celular: string;
  id_rol: string; // id del rol
}
export interface CrearUsuarioContrasenaDto extends CrearUsuarioDto {
  contrasena: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly base = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  listarActivosSinVeterinario() {
    return this.http.get<UsuarioDto[]>(`${this.base}/activos-sin-veterinario`);
  }

  crearConContrasena(body: CrearUsuarioContrasenaDto) {
    return this.http.post<any>(`${this.base}/crear-contrasena`, body);
  }
}
