import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistorialClinicoService,
  VeterinarioDto,
  ApiMessageResponse,
  ActualizarProcedimientoDto
} from '../historial-clinico.service';

@Component({
  selector: 'app-modal-editar-procedimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-procedimiento.component.html',
  styleUrl: './modal-editar-procedimiento.component.scss',
})
export class ModalEditarProcedimientoComponent implements OnInit {
  @Input({ required: true }) idMascota!: string;
  @Input({ required: true }) data!: any; // debe tener _id

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
      tipo_procedimiento: ['', [Validators.required, Validators.minLength(3)]],
      fecha: ['', [Validators.required]], // date
      anestesia_riesgo: [''],
      notas: [''],
      complicaciones: [''],
      id_veterinario: [''], // opcional
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.patchFormFromData();
  }

  private patchFormFromData() {
    const p = this.data || {};
    this.form.patchValue({
      tipo_procedimiento: p.tipo_procedimiento || '',
      fecha: this.toDateInputValue(p.fecha),
      anestesia_riesgo: p.anestesia_riesgo || '',
      notas: p.notas || '',
      complicaciones: p.complicaciones || '',
      id_veterinario: p.id_veterinario?._id || p.id_veterinario || '',
    });
  }

  private cargarVeterinarios() {
    this.cargandoVets = true;
    this.service.listarVeterinarios().subscribe({
      next: (res) => {
        this.vets = res ?? [];
        this.cargandoVets = false;

        const current = this.form.get('id_veterinario')?.value;
        if (!current && this.vets.length === 1) {
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
      this.errorMsg = 'No se encontró el id del procedimiento.';
      return;
    }

    this.cargando = true;
    const f = this.form.value;

    const body: ActualizarProcedimientoDto = {
      tipo_procedimiento: (f.tipo_procedimiento || '').trim(),
      fecha: f.fecha,
      anestesia_riesgo: (f.anestesia_riesgo || '').trim(),
      notas: (f.notas || '').trim(),
      complicaciones: (f.complicaciones || '').trim(),
      id_veterinario: f.id_veterinario ? f.id_veterinario : null,
    };

    this.service.actualizarProcedimiento(this.idMascota, this.data._id, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Procedimiento actualizado correctamente';
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar el procedimiento.';
      },
    });
  }

  cancelar() {
    this.close.emit();
  }

  private toDateInputValue(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
