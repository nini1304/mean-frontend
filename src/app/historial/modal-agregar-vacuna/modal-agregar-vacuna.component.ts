import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HistorialClinicoService, VeterinarioDto, CrearVacunaDto, ApiMessageResponse } from '../historial-clinico.service';

@Component({
  selector: 'app-modal-agregar-vacuna',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agregar-vacuna.component.html',
  styleUrl: './modal-agregar-vacuna.component.scss',
})
export class ModalAgregarVacunaComponent implements OnInit {
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
      vacuna: ['', [Validators.required, Validators.minLength(3)]],
      fecha_aplicacion: ['', [Validators.required]],  // date
      fecha_refuerzo: [''],                           // date opcional
      id_veterinario: [''],                           // opcional (pero lo mostramos)
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.cargarVeterinarios();
    // fecha hoy por defecto
    this.form.patchValue({ fecha_aplicacion: this.toDateInputValue(new Date()) });
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

    const body: CrearVacunaDto = {
      vacuna: (v.vacuna || '').trim(),
      fecha_aplicacion: v.fecha_aplicacion,
      fecha_refuerzo: v.fecha_refuerzo ? v.fecha_refuerzo : null,
      id_veterinario: v.id_veterinario ? v.id_veterinario : null,
      observaciones: (v.observaciones || '').trim(),
    };

    this.service.crearVacuna(this.idMascota, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Vacuna registrada correctamente';
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo registrar la vacuna.';
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
