import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TipoCita = 'CONSULTA' | 'VACUNA' | 'CONTROL' | 'CIRUGIA' | 'OTRO';
export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'NO_ASISTIO' | 'COMPLETADA';


export interface CitaDto {
  _id: string;

  id_veterinario: string | {
    _id: string;
    especialidad: string;
    id_usuario?: {
      _id: string;
      nombre_completo: string;
      correo: string;
      numero_celular: string;
    };
  };

  id_mascota: string | {
    _id: string;
    nombre: string;
    raza?: string;
    edad?: number;
    peso?: number;
    tipo_mascota?: { _id: string; tipo_mascota: string };
  };

  dueno?: {
    id: string;
    nombre_completo: string;
    correo: string;
    numero_celular: string;
  } | null;

  start: string;
  end: string;
  tipo: any;
  estado: any;
  motivo?: string;
  notas?: string;
}




export interface CrearCitaDto {
  id_veterinario: string;
  id_mascota: string;
  tipo: TipoCita;
  start: string;
  end: string;
  motivo?: string;
  estado?: EstadoCita; // opcional si backend default PENDIENTE
}


@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly base = 'http://localhost:3000/api/citas';

  constructor(private http: HttpClient) {}

  listarPorRango(params: { start: string; end: string; id_veterinario?: string }) {
    return this.http.get<CitaDto[]>(this.base, { params: params as any });
  }

  crear(body: CrearCitaDto) {
    return this.http.post<any>(this.base, body);
  }

  mover(idCita: string, body: { start: string; end: string }) {
    return this.http.put<any>(`${this.base}/${idCita}`, body);
  }

  cancelar(idCita: string, body: { motivo?: string }) {
    return this.http.patch<any>(`${this.base}/${idCita}/cancelar`, body);
  }
}
