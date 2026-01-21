import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistorialClinicoService,
  VeterinarioDto,
  CrearDesparasitacionDto,
  ApiMessageResponse,
} from '../historial-clinico.service';

@Component({
  selector: 'app-modal-agregar-desparasitacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agregar-desparasitacion.component.html',
  styleUrl: './modal-agregar-desparasitacion.component.scss',
})
export class ModalAgregarDesparasitacionComponent implements OnInit {
  @Input({ required: true }) idMascota!: string;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  cargando = false;
  cargandoVets = false;
  errorMsg = '';
  okMsg = '';

  vets: VeterinarioDto[] = [];
  form: FormGroup;

  constructor(private fb: FormBuilder, private service: HistorialClinicoService) {
    this.form = this.fb.group({
      producto: ['', [Validators.required, Validators.minLength(2)]],
      fecha: ['', [Validators.required]],          // date
      dosis: ['', [Validators.required, Validators.minLength(1)]],
      proxima: [''],                                // date opcional
      id_veterinario: [''],                         // opcional
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    this.form.patchValue({ fecha: this.toDateInputValue(new Date()) });
  }

  private cargarVeterinarios() {
    this.cargandoVets = true;
    this.service.listarVeterinarios().subscribe({
      next: (res) => {
        this.vets = res ?? [];
        this.cargandoVets = false;
        if (this.vets.length === 1) this.form.patchValue({ id_veterinario: this.vets[0].id });
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

    this.cargando = true;
    const v = this.form.value;

    const body: CrearDesparasitacionDto = {
      producto: (v.producto || '').trim(),
      fecha: v.fecha,
      dosis: (v.dosis || '').trim(),
      proxima: v.proxima ? v.proxima : null,
      id_veterinario: v.id_veterinario ? v.id_veterinario : null,
      observaciones: (v.observaciones || '').trim(),
    };

    this.service.crearDesparasitacion(this.idMascota, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Desparasitación registrada correctamente';
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo registrar la desparasitación.';
      },
    });
  }

  cancelar() {
    this.close.emit();
  }

  private toDateInputValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}
