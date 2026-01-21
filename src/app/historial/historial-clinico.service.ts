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

export interface tipo_mascotaDto {
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
    examenes: ExamenDto[];
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

export interface AdjuntoDto {
    bucket: string;
    objectKey: string;
    url: string;
    mimeType?: string;
    nombreOriginal?: string;
    size?: number;
    uploadedAt?: string;
}

export interface ExamenDto {
    _id?: string;
    tipo: string;
    fecha: string;
    resultado?: string;
    valores?: any;
    adjuntos?: AdjuntoDto[];
    id_veterinario?: any;
}
export interface CrearExamenDto {
    tipo: string;
    fecha: string; // ISO string
    resultado?: string;
    valores?: any;
    id_veterinario?: string | null;
}


export interface ActualizarConsultaDto {
    fecha?: string;
    id_veterinario?: string;
    motivo_consulta?: string;
    peso_en_consulta?: number;
    temperatura?: number | null;
    diagnostico?: string;
    tratamiento?: string;
    observaciones?: string;
}


export interface ActualizarVacunaDto {
    vacuna?: string;
    fecha_aplicacion?: string;
    fecha_refuerzo?: string | null;
    id_veterinario?: string | null;
    observaciones?: string;
}

export interface ActualizarDesparasitacionDto {
    producto?: string;
    fecha?: string;
    dosis?: string;
    proxima?: string | null;
    id_veterinario?: string | null;
    observaciones?: string;
}

export interface ActualizarProcedimientoDto {
    tipo_procedimiento?: string;
    fecha?: string;
    anestesia_riesgo?: string;
    notas?: string;
    complicaciones?: string;
    id_veterinario?: string | null;
}

export interface ActualizarExamenDto {
    tipo?: string;
    fecha?: string;
    resultado?: string;
    valores?: any;              // objeto (se manda JSON)
    id_veterinario?: string | null;
}


@Injectable({ providedIn: 'root' })
export class HistorialClinicoService {
    private readonly baseHistorial = 'http://localhost:3000/api/historial';
    private readonly baseVets = 'http://localhost:3000/api/veterinarios';

    constructor(private http: HttpClient) { }

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


    crearDesparasitacion(
        idMascota: string,
        body: CrearDesparasitacionDto
    ): Observable<ApiMessageResponse> {
        return this.http.post<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/desparasitaciones`,
            body
        );
    }


    crearProcedimiento(
        idMascota: string,
        body: CrearProcedimientoDto
    ): Observable<ApiMessageResponse> {
        return this.http.post<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/procedimientos`,
            body
        );
    }

    crearExamenConAdjunto(
        idMascota: string,
        body: CrearExamenDto,
        archivo: File
    ): Observable<ApiMessageResponse> {
        const fd = new FormData();

        // 👇 coincide con upload.single("archivo")
        fd.append('archivo', archivo);

        // 👇 coincide con req.body.tipo, req.body.fecha, ...
        fd.append('tipo', body.tipo);
        fd.append('fecha', body.fecha);
        fd.append('resultado', body.resultado ?? '');
        fd.append('id_veterinario', body.id_veterinario ?? '');

        if (body.valores !== undefined && body.valores !== null && body.valores !== '') {
            fd.append('valores', typeof body.valores === 'string' ? body.valores : JSON.stringify(body.valores));
        }

        // 👇 coincide con tu ruta real
        return this.http.post<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/examenes/upload`,
            fd
        );
    }

    actualizarConsulta(
        idMascota: string,
        idConsulta: string,
        body: ActualizarConsultaDto
    ): Observable<ApiMessageResponse> {
        return this.http.put<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/consultas/${idConsulta}`,
            body
        );
    }

    actualizarVacuna(
        idMascota: string,
        idVacuna: string,
        body: ActualizarVacunaDto
    ) {
        return this.http.put<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/vacunas/${idVacuna}`,
            body
        );
    }

    actualizarDesparasitacion(
        idMascota: string,
        idDesparasitacion: string,
        body: ActualizarDesparasitacionDto
    ) {
        return this.http.put<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/desparasitaciones/${idDesparasitacion}`,
            body
        );
    }

    actualizarProcedimiento(
        idMascota: string,
        idProcedimiento: string,
        body: ActualizarProcedimientoDto
    ) {
        return this.http.put<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/procedimientos/${idProcedimiento}`,
            body
        );
    }

    actualizarExamen(idMascota: string, idExamen: string, body: ActualizarExamenDto) {
        return this.http.put<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/examenes/${idExamen}`,
            body
        );
    }

    agregarAdjuntoExamen(idMascota: string, idExamen: string, archivo: File) {
        const fd = new FormData();
        fd.append('archivo', archivo); // 👈 debe llamarse "archivo"
        return this.http.post<ApiMessageResponse>(
            `${this.baseHistorial}/${idMascota}/examenes/${idExamen}/adjuntos`,
            fd
        );
    }



}
