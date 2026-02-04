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

export interface ClienteActivoDto {
  _id: string;
  nombre_completo: string;
  correo: string;
  numero_celular: string;
  id_rol: { _id: string; nombre: string };
  eliminado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TipoMascotaDto {
  _id: string;
  tipo_mascota: string; // "GATO" | "PERRO"
}

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly baseUrl = '/api/usuario-mascota';
  private readonly basePacientes = '/api/pacientes';
  private readonly baseUsers = '/api/users';
  private readonly baseTipoMascota = '/api/tipo-mascota';

  constructor(private http: HttpClient) {}

  listarMascotas(): Observable<UsuarioMascotaDto[]> {
    return this.http.get<UsuarioMascotaDto[]>(`${this.baseUrl}/mascotas`);
  }

   eliminarMascota(idMascota: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${this.basePacientes}/${idMascota}`);
  }

  listarClientesActivos(): Observable<ClienteActivoDto[]> {
    return this.http.get<ClienteActivoDto[]>(`${this.baseUsers}/clientes-activos`);
  }

  listarTiposMascota(): Observable<TipoMascotaDto[]> {
    return this.http.get<TipoMascotaDto[]>(`${this.baseTipoMascota}`);
  }

  // Dueño existente
  registrarMascotasAUsuario(
    idUsuario: string,
    body: { mascotas: Array<{ nombre: string; tipo_mascota: string; edad: number; peso: number; sexo: string; raza: string }> }
  ): Observable<any> {
    return this.http.post<any>(`${this.basePacientes}/${idUsuario}/mascotas`, body);
  }

  // Dueño nuevo
  crearPaciente(body: {
    dueno: { nombre_completo: string; correo: string; numero_celular: string };
    mascotas: Array<{ nombre: string; tipo_mascota: string; edad: number; peso: number; sexo: string; raza: string }>;
  }): Observable<any> {
    return this.http.post<any>(`${this.basePacientes}`, body);
  }

    actualizarPacientePorMascota(
    idMascota: string,
    body: {
      dueno: { nombre_completo?: string; numero_celular?: string };
      mascota: { nombre?: string; edad?: string; peso?: number; raza?: string };
    }
  ): Observable<any> {
    return this.http.put<any>(`${this.basePacientes}/${idMascota}`, body);
  }

}
