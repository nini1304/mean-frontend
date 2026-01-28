import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface VetUsuarioDto {
  id: string;
  nombre_completo: string;
  correo: string;
  numero_celular: string;
}

export interface VeterinarioDto {
  id: string;
  especialidad: string;
  usuario: VetUsuarioDto;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class VeterinariosService {
  private readonly base = 'http://localhost:3000/api/veterinarios';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<VeterinarioDto[]>(this.base);
  }
}
