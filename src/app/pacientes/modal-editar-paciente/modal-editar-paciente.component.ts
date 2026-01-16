import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { PacientesService, UsuarioMascotaDto } from '../paciente.service';

@Component({
  selector: 'app-modal-editar-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-paciente.component.html',
  styleUrl: './modal-editar-paciente.component.scss',
})
export class ModalEditarPacienteComponent implements OnChanges {
  @Input() data: UsuarioMascotaDto | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  cargando = false;
  errorMsg = '';
  okMsg = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private pacientesService: PacientesService) {
    this.form = this.fb.group({
      dueno: this.fb.group({
        nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
        correo: ['', [Validators.required, Validators.email]],
        numero_celular: ['', [Validators.required]],
      }),
      mascota: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        edad: ['', [Validators.required, this.edadValidator()]],
        peso: [0, [Validators.required, Validators.min(0)]],
        raza: ['', [Validators.required, Validators.minLength(2)]],
      }),
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Prellenar
      this.form.patchValue({
        dueno: {
          nombre_completo: this.data.dueno?.nombre_completo ?? '',
          correo: this.data.dueno?.correo ?? '',
          numero_celular: this.data.dueno?.numero_celular ?? '',
        },
        mascota: {
          nombre: this.data.mascota?.nombre ?? '',
          edad: this.data.mascota?.edad ?? '',
          peso: this.data.mascota?.peso ?? 0,
          raza: this.data.mascota?.raza ?? '',
        },
      });


      this.errorMsg = '';
      this.okMsg = '';
      this.form.markAsPristine();
    }
  }

  private edadValidator() {
    // acepta: "4 años", "4 anios", "6 meses", "10 MESES"
    const re = /^\s*(\d+)\s*(años|anos|meses)\s*$/i;

    return (control: AbstractControl) => {
      const v = (control.value ?? '').toString().trim();
      if (!v) return null;

      const m = v.match(re);
      if (!m) return { edadFormato: true };

      const num = Number(m[1]);
      if (Number.isNaN(num) || num < 0) return { edadFormato: true };

      return null;
    };
  }

  submit() {
    this.errorMsg = '';
    this.okMsg = '';

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMsg = 'Revisa los campos obligatorios.';
      return;
    }

    if (!this.data?.mascota?.id) {
      this.errorMsg = 'No se encontró el ID de la mascota.';
      return;
    }

    const idMascota = this.data.mascota.id;

    // Normalizamos edad (opcional): "10 meses" -> "10 MESES"
    const rawEdad: string = this.form.value?.mascota?.edad || '';
    const edad = rawEdad.trim().toUpperCase();

    const body = {
      dueno: {
        nombre_completo: this.form.value.dueno.nombre_completo,
        correo: this.form.value.dueno.correo,
        numero_celular: this.form.value.dueno.numero_celular,
      },
      mascota: {
        nombre: this.form.value.mascota.nombre,
        edad,
        peso: Number(this.form.value.mascota.peso),
        raza: this.form.value.mascota.raza,
      },
    };


    this.cargando = true;

    this.pacientesService.actualizarPacientePorMascota(idMascota, body).subscribe({
      next: (res) => {
        this.cargando = false;
        this.okMsg = res?.message || 'Paciente actualizado correctamente';
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar el paciente.';
      },
    });
  }

  cancelar() {
    this.close.emit();
  }
}
