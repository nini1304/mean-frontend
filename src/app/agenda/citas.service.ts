import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
export type TipoCita = 'CITA' | 'VACUNA' | 'CONTROL' | 'PROCEDIMIENTO'; // ajusta a tu gusto

export interface CitaDto {
  _id: string;
  id_veterinario: string;
  id_mascota: string;
  tipo: TipoCita;
  start: string; // ISO
  end: string;   // ISO
  motivo?: string;
  estado: EstadoCita;
}

export interface CrearCitaDto {
  id_veterinario: string;
  id_mascota: string;
  tipo: TipoCita;
  start: string;
  end: string;
  motivo?: string;
  estado?: EstadoCita;
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
