import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiMessageResponse<T = any> {
  message: string;
  data?: T;
}

export interface VeterinarioDto {
  id: string;
  especialidad: string;
  usuario: {
    id: string;
    nombre_completo: string;
    correo: string;
    numero_celular: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DuenoMiniDto {
  id: string;
  nombre_completo: string;
  correo: string;
  numero_celular: string;
}

export interface MascotaMiniDto {
  _id: string;
  nombre: string;
  edad: string | number;
  peso: number;
  sexo: string;
  raza: string;
  tipo_mascota: tipo_mascotaDto;
}

export interface tipo_mascotaDto{
    _id: string;
    tipo_mascota: string;


}

export interface HistorialClinicoDto {
  _id: string;
  id_mascota: MascotaMiniDto;
  consultas: any[];
  vacunas: any[];
  desparasitaciones: any[];
  procedimientos: any[];
  examenes: any[];
  dueno: DuenoMiniDto | null;
  createdAt: string;
  updatedAt: string;
}

// ...imports y tipos que ya tienes

export interface CrearConsultaDto {
  fecha: string;
  id_veterinario: string;
  motivo_consulta: string;
  peso_en_consulta: number;
  temperatura?: number | null;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
}

export interface CrearVacunaDto {
  vacuna: string;
  fecha_aplicacion: string;
  fecha_refuerzo?: string | null;
  id_veterinario?: string | null;
  observaciones?: string;
}

export interface CrearDesparasitacionDto {
  producto: string;
  fecha: string;
  dosis: string;
  proxima?: string | null;
  id_veterinario?: string | null; // opcional en tu schema
  observaciones?: string;
}

export interface CrearProcedimientoDto {
  tipo_procedimiento: string;
  fecha: string;
  anestesia_riesgo?: string;
  notas?: string;
  complicaciones?: string;
  id_veterinario?: string | null;
}




@Injectable({ providedIn: 'root' })
export class HistorialClinicoService {
  private readonly baseHistorial = 'http://localhost:3000/api/historial';
  private readonly baseVets = 'http://localhost:3000/api/veterinarios';

  constructor(private http: HttpClient) {}

  initHistorial(idMascota: string) {
    return this.http.post(`${this.baseHistorial}/${idMascota}/init`, {});
  }

  obtenerHistorial(idMascota: string) {
    return this.http.get<HistorialClinicoDto>(`${this.baseHistorial}/${idMascota}`);
  }

  listarVeterinarios() {
    return this.http.get<VeterinarioDto[]>(`${this.baseVets}`);
  }

  crearConsulta(idMascota: string, body: CrearConsultaDto): Observable<ApiMessageResponse> {
  return this.http.post<ApiMessageResponse>(`${this.baseHistorial}/${idMascota}/consultas`, body);
}

 crearVacuna(idMascota: string, body: CrearVacunaDto): Observable<ApiMessageResponse> {
  return this.http.post<ApiMessageResponse>(`${this.baseHistorial}/${idMascota}/vacunas`, body);
}


  crearDesparasitacion(idMascota: string, body: CrearDesparasitacionDto) {
    return this.http.post(`${this.baseHistorial}/${idMascota}/desparasitaciones`, body);
  }

  crearProcedimiento(idMascota: string, body: CrearProcedimientoDto) {
    return this.http.post(`${this.baseHistorial}/${idMascota}/procedimientos`, body);
  }
}
