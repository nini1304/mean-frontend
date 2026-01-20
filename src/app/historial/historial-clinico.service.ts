import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class HistorialClinicoService {
  private readonly baseHistorial = 'http://localhost:3000/api/historial';
  private readonly baseVets = 'http://localhost:3000/api/veterinarios';

  constructor(private http: HttpClient) {}

  initHistorial(idMascota: string): Observable<any> {
    return this.http.post(`${this.baseHistorial}/${idMascota}/init`, {});
  }

  obtenerHistorial(idMascota: string): Observable<HistorialClinicoDto> {
    return this.http.get<HistorialClinicoDto>(`${this.baseHistorial}/${idMascota}`);
  }

  listarVeterinarios(): Observable<VeterinarioDto[]> {
    return this.http.get<VeterinarioDto[]>(`${this.baseVets}`);
  }

  // TODO: cuando me confirmes endpoints, agregamos:
  // crearConsulta / crearVacuna / crearDesparasitacion / crearProcedimiento / subirExamen
}
