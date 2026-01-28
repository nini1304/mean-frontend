import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface VetUsuarioDto {
  id?: string; 
  nombre_completo: string;
  correo: string;
  numero_celular: string;
}


export interface HorarioDto {
  dia_semana: number;      // 1..7 (según tu backend)
  hora_inicio: string;     // "08:00"
  hora_fin: string;        // "12:00"
}

export interface VeterinarioDto {
  id: string;
  especialidad: string;
  usuario: VetUsuarioDto;
  createdAt: string;
  updatedAt: string;
}

export interface CrearVeterinarioCompletoDto {
  usuario: VetUsuarioDto;
  contrasena: string;
  especialidad: string;
  horarios: HorarioDto[];
}


@Injectable({ providedIn: 'root' })
export class VeterinariosService {
  private readonly base = 'http://localhost:3000/api/veterinarios';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<VeterinarioDto[]>(this.base);
  }

  crearCompleto(body: CrearVeterinarioCompletoDto) {
    return this.http.post<any>(`${this.base}/completo`, body);
  }
}
