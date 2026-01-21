import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  HistorialClinicoService,
  VeterinarioDto,
  CrearProcedimientoDto,
  ApiMessageResponse,
} from '../historial-clinico.service';

@Component({
  selector: 'app-modal-agregar-procedimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agregar-procedimiento.component.html',
  styleUrl: './modal-agregar-procedimiento.component.scss',
})
export class ModalAgregarProcedimientoComponent implements OnInit {
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
      tipo_procedimiento: ['', [Validators.required, Validators.minLength(3)]],
      fecha: ['', [Validators.required]],        // date
      anestesia_riesgo: [''],
      notas: [''],
      complicaciones: [''],
      id_veterinario: [''],                      // opcional
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

    const body: CrearProcedimientoDto = {
      tipo_procedimiento: (v.tipo_procedimiento || '').trim(),
      fecha: v.fecha,
      anestesia_riesgo: (v.anestesia_riesgo || '').trim(),
      notas: (v.notas || '').trim(),
      complicaciones: (v.complicaciones || '').trim(),
      id_veterinario: v.id_veterinario ? v.id_veterinario : null,
    };

    this.service.crearProcedimiento(this.idMascota, body).subscribe({
      next: (res: ApiMessageResponse) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Procedimiento registrado correctamente';
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo registrar el procedimiento.';
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
