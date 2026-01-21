import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistorialClinicoService,
  VeterinarioDto,
  ApiMessageResponse,
  ActualizarVacunaDto
} from '../historial-clinico.service';

@Component({
  selector: 'app-modal-editar-vacuna',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-vacuna.component.html',
  styleUrl: './modal-editar-vacuna.component.scss',
})
export class ModalEditarVacunaComponent implements OnInit {
  @Input({ required: true }) idMascota!: string;
  @Input({ required: true }) data!: any; // vacuna seleccionada (debe tener _id)

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
      vacuna: ['', [Validators.required, Validators.minLength(3)]],
      fecha_aplicacion: ['', [Validators.required]], // date
      fecha_refuerzo: [''],                          // date opcional
      id_veterinario: [''],                          // opcional
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.patchFormFromData();
  }

  private patchFormFromData() {
    const v = this.data || {};

    this.form.patchValue({
      vacuna: v.vacuna || '',
      fecha_aplicacion: this.toDateInputValue(v.fecha_aplicacion),
      fecha_refuerzo: v.fecha_refuerzo ? this.toDateInputValue(v.fecha_refuerzo) : '',
      id_veterinario: v.id_veterinario?._id || v.id_veterinario || '',
      observaciones: v.observaciones || '',
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
      this.errorMsg = 'No se encontró el id de la vacuna.';
      return;
    }

    this.cargando = true;

    const f = this.form.value;

    const body: ActualizarVacunaDto = {
      vacuna: (f.vacuna || '').trim(),
      fecha_aplicacion: f.fecha_aplicacion,
      fecha_refuerzo: f.fecha_refuerzo ? f.fecha_refuerzo : null,
      id_veterinario: f.id_veterinario ? f.id_veterinario : null,
      observaciones: (f.observaciones || '').trim(),
    };

    this.service.actualizarVacuna(this.idMascota, this.data._id, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Vacuna actualizada correctamente';
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la vacuna.';
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
