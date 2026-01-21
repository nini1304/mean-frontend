import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistorialClinicoService,
  VeterinarioDto,
  ApiMessageResponse,
  ActualizarConsultaDto
} from '../historial-clinico.service';

@Component({
  selector: 'app-modal-editar-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-consulta.component.html',
  styleUrl: './modal-editar-consulta.component.scss',
})
export class ModalEditarConsultaComponent implements OnInit {
  @Input({ required: true }) idMascota!: string;
  @Input({ required: true }) data!: any; // la consulta seleccionada (debe tener _id)

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  cargando = false;
  cargandoVets = false;
  errorMsg = '';
  okMsg = '';

  vets: VeterinarioDto[] = [];
  form: FormGroup;

  constructor(private fb: FormBuilder, private service: HistorialClinicoService) {
    this.form = this.fb.group({
      fechaLocal: ['', [Validators.required]],
      id_veterinario: ['', [Validators.required]],
      motivo_consulta: ['', [Validators.required, Validators.minLength(3)]],
      peso_en_consulta: [null, [Validators.required, Validators.min(0)]],
      temperatura: [null, [Validators.min(0)]],
      diagnostico: [''],
      tratamiento: [''],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.patchFormFromData();
  }

  private patchFormFromData() {
    const c = this.data || {};
    const fecha = c.fecha ? new Date(c.fecha) : new Date();

    this.form.patchValue({
      fechaLocal: this.toDatetimeLocalValue(fecha),
      id_veterinario: c.id_veterinario?._id || c.id_veterinario || '',
      motivo_consulta: c.motivo_consulta || '',
      peso_en_consulta: c.peso_en_consulta ?? null,
      temperatura: c.temperatura ?? null,
      diagnostico: c.diagnostico || '',
      tratamiento: c.tratamiento || '',
      observaciones: c.observaciones || '',
    });
  }

  private cargarVeterinarios() {
    this.cargandoVets = true;
    this.service.listarVeterinarios().subscribe({
      next: (res) => {
        this.vets = res ?? [];
        this.cargandoVets = false;

        // si la consulta no tenía vet y solo hay uno, autoselecciona
        const currentVet = this.form.get('id_veterinario')?.value;
        if (!currentVet && this.vets.length === 1) {
          this.form.patchValue({ id_veterinario: this.vets[0].id });
        }
      },
      error: () => {
        this.vets = [];
        this.cargandoVets = false;
      },
    });
  }

  submit() {
    this.errorMsg = '';
    this.okMsg = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMsg = 'Revisa los campos obligatorios.';
      return;
    }

    if (!this.data?._id) {
      this.errorMsg = 'No se encontró el id de la consulta.';
      return;
    }

    this.cargando = true;

    const v = this.form.value;

    const body: ActualizarConsultaDto = {
      fecha: this.datetimeLocalToISO(v.fechaLocal),
      id_veterinario: v.id_veterinario,
      motivo_consulta: (v.motivo_consulta || '').trim(),
      peso_en_consulta: Number(v.peso_en_consulta),
      temperatura: v.temperatura === null || v.temperatura === '' ? null : Number(v.temperatura),
      diagnostico: (v.diagnostico || '').trim(),
      tratamiento: (v.tratamiento || '').trim(),
      observaciones: (v.observaciones || '').trim(),
    };

    this.service.actualizarConsulta(this.idMascota, this.data._id, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Consulta actualizada correctamente';
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la consulta.';
      },
    });
  }

  cancelar() {
    this.close.emit();
  }

  private datetimeLocalToISO(value: string): string {
    const d = new Date(value);
    return d.toISOString();
  }

  private toDatetimeLocalValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }
}
