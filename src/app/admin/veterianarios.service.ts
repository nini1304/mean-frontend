import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface VetUsuarioDto {
  id?: string; 
  nombre_completo: string;
  correo: string;
  numero_celular: string;
}


export interface HorarioDto {
  id?: string;
  dia_semana: number;   // ojo: tu backend devuelve 0..6 (según tu ejemplo)
  hora_inicio: string;  // "08:00"
  hora_fin: string;     // "12:00"
  activo?: boolean;
}

export interface VeterinarioDto {
  id: string;
  especialidad: string;
  usuario: VetUsuarioDto;
  horarios?: HorarioDto[];   // ✅ ahora viene en la respuesta
  createdAt: string;
  updatedAt: string;
}

export interface CrearVeterinarioCompletoDto {
  usuario: VetUsuarioDto;
  contrasena: string;
  especialidad: string;
  horarios: HorarioDto[];
}

export interface ActualizarVeterinarioDto {
  usuario: {
    nombre_completo: string;
    correo: string;
    numero_celular: string;
  };
  especialidad: string;
  horarios: {
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean;
  }[];
}


@Injectable({ providedIn: 'root' })
export class VeterinariosService {
  private readonly base = 'http://localhost:3000/api/veterinarios';

  constructor(private http: HttpClient) {}

  listarConHorarios(soloActivos: boolean = false) {
    const params = new HttpParams().set('soloActivos', String(soloActivos));
    return this.http.get<VeterinarioDto[]>(`${this.base}/con-horarios`, { params });
  }

  crearCompleto(body: CrearVeterinarioCompletoDto) {
    return this.http.post<any>(`${this.base}/completo`, body);
  }

   actualizar(id: string, body: ActualizarVeterinarioDto) {
    return this.http.put<any>(`${this.base}/${id}`, body);
  }
}
