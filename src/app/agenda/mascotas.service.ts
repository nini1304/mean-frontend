import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface MascotaRelacionDto {
  id_relacion: string;
  activo: boolean;
  mascota: {
    id: string;
    nombre: string;
    edad: any;
    peso: any;
    sexo: string;
    raza: string;
    tipo_mascota: string;
    id_tipo_mascota: string;
  };
  dueno: {
    id: string;
    nombre_completo: string;
    correo: string;
    numero_celular: string;
  };
}

@Injectable({ providedIn: 'root' })
export class MascotasService {
  private readonly base = 'http://localhost:3000/api/usuario-mascota/mascotas';
  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<MascotaRelacionDto[]>(this.base);
  }
}
