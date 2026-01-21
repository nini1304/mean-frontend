import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistorialClinicoService,
  VeterinarioDto,
  ApiMessageResponse,
  ActualizarDesparasitacionDto
} from '../historial-clinico.service';

@Component({
  selector: 'app-modal-editar-desparasitacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-desparasitacion.component.html',
  styleUrl: './modal-editar-desparasitacion.component.scss',
})
export class ModalEditarDesparasitacionComponent implements OnInit {
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
      producto: ['', [Validators.required, Validators.minLength(2)]],
      fecha: ['', [Validators.required]], // date
      dosis: ['', [Validators.required, Validators.minLength(1)]],
      proxima: [''],                      // date opcional
      id_veterinario: [''],               // opcional
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.patchFormFromData();
  }

  private patchFormFromData() {
    const d = this.data || {};
    this.form.patchValue({
      producto: d.producto || '',
      fecha: this.toDateInputValue(d.fecha),
      dosis: d.dosis || '',
      proxima: d.proxima ? this.toDateInputValue(d.proxima) : '',
      id_veterinario: d.id_veterinario?._id || d.id_veterinario || '',
      observaciones: d.observaciones || '',
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
      this.errorMsg = 'No se encontró el id de la desparasitación.';
      return;
    }

    this.cargando = true;
    const f = this.form.value;

    const body: ActualizarDesparasitacionDto = {
      producto: (f.producto || '').trim(),
      fecha: f.fecha,
      dosis: (f.dosis || '').trim(),
      proxima: f.proxima ? f.proxima : null,
      id_veterinario: f.id_veterinario ? f.id_veterinario : null,
      observaciones: (f.observaciones || '').trim(),
    };

    this.service.actualizarDesparasitacion(this.idMascota, this.data._id, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Desparasitación actualizada correctamente';
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la desparasitación.';
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
