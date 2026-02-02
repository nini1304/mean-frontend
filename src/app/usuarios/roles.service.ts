import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RolDto {
  _id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly base = '/api/roles';

  constructor(private http: HttpClient) {}

  listarSinVeterinario(): Observable<RolDto[]> {
    return this.http.get<RolDto[]>(`${this.base}/sin-veterinario`);
  }
}
