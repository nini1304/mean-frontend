import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MascotaDto {
  id: string;
  nombre: string;
  edad: number;
  peso: number;
  sexo: 'MACHO' | 'HEMBRA';
  raza: string;
  tipo_mascota: string;
  id_tipo_mascota: string;
}

export interface DuenoDto {
  id: string;
  nombre_completo: string;
  correo: string;
  numero_celular: string;
}

export interface UsuarioMascotaDto {
  id_relacion: string;
  activo: boolean;
  mascota: MascotaDto;
  dueno: DuenoDto;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly baseUrl = 'http://localhost:3000/api/usuario-mascota';
  private readonly basePacientes = 'http://localhost:3000/api/pacientes';

  constructor(private http: HttpClient) {}

  listarMascotas(): Observable<UsuarioMascotaDto[]> {
    return this.http.get<UsuarioMascotaDto[]>(`${this.baseUrl}/mascotas`);
  }

   eliminarMascota(idMascota: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${this.basePacientes}/${idMascota}`);
  }
}
