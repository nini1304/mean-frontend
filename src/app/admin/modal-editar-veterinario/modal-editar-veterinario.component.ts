import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActualizarVeterinarioDto, VeterinarioDto, VeterinariosService } from '../veterianarios.service';
import { NonNullableFormBuilder } from '@angular/forms';


function horaRangoValido(group: AbstractControl): ValidationErrors | null {
  const ini = group.get('hora_inicio')?.value;
  const fin = group.get('hora_fin')?.value;
  if (!ini || !fin) return null;
  return ini < fin ? null : { horaRangoInvalido: true };
}

@Component({
  selector: 'app-modal-editar-veterinario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-veterinario.component.html',
  styleUrl: './modal-editar-veterinario.component.scss',
})
export class ModalEditarVeterinarioComponent implements OnInit {
  @Input() veterinario!: VeterinarioDto;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  cargando = false;
  errorMsg = '';
  okMsg = '';

  form;

  constructor(
  private fb: NonNullableFormBuilder,
  private veterinariosService: VeterinariosService
) {
  this.form = this.fb.group({
    usuario: this.fb.group({
      nombre_completo: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      correo: this.fb.control('', [Validators.required, Validators.email]),
      numero_celular: this.fb.control('', [Validators.required]),
    }),

    especialidad: this.fb.control('', [Validators.required, Validators.minLength(3)]),

    horarios: this.fb.array([]),
  });
}


  ngOnInit(): void {
    // precargar valores
    this.form.patchValue({
      usuario: {
        nombre_completo: this.veterinario?.usuario?.nombre_completo ?? '',
        correo: this.veterinario?.usuario?.correo ?? '',
        numero_celular: this.veterinario?.usuario?.numero_celular ?? '',
      },
      especialidad: this.veterinario?.especialidad ?? '',
    });

    // precargar horarios
    const hs = (this.veterinario?.horarios ?? []).slice();
    // ordenar para que se vea prolijo
    hs.sort((a, b) => (a.dia_semana ?? 0) - (b.dia_semana ?? 0) || (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));

    hs.forEach(h => this.horariosArr.push(this.nuevoHorario(h)));
    // si no hay horarios, arranca con uno
    if (this.horariosArr.length === 0) this.agregarHorario();
  }

  get horariosArr(): FormArray {
    return this.form.get('horarios') as FormArray;
  }

  get sinHorarios(): boolean {
    return this.horariosArr.length === 0;
  }

  nuevoHorario(h?: any) {
    return this.fb.group(
      {
        dia_semana: [h?.dia_semana ?? 0, [Validators.required, Validators.min(0), Validators.max(6)]],
        hora_inicio: [h?.hora_inicio ?? '08:00', [Validators.required]],
        hora_fin: [h?.hora_fin ?? '12:00', [Validators.required]],
        activo: [h?.activo ?? true, [Validators.required]],
      },
      { validators: [horaRangoValido] }
    );
  }

  agregarHorario() {
    this.horariosArr.push(this.nuevoHorario());
  }

  quitarHorario(i: number) {
    this.horariosArr.removeAt(i);
  }

  cancelar() {
    this.close.emit();
  }

  submit() {
    this.errorMsg = '';
    this.okMsg = '';

    if (this.sinHorarios) {
      this.errorMsg = 'Debes registrar al menos un horario.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.horariosArr.controls.forEach(c => c.markAllAsTouched());
      this.errorMsg = 'Completa los campos obligatorios.';
      return;
    }

    this.cargando = true;

    const raw = this.form.getRawValue();

    const payload: ActualizarVeterinarioDto = {
      usuario: {
        nombre_completo: raw.usuario.nombre_completo,
        correo: raw.usuario.correo,
        numero_celular: raw.usuario.numero_celular,
      },
      especialidad: raw.especialidad,
      horarios: (raw.horarios ?? []).map((h: any) => ({
        dia_semana: Number(h.dia_semana),
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        activo: !!h.activo,
      })),
    };

    this.veterinariosService.actualizar(this.veterinario.id, payload).subscribe({
      next: () => {
        this.cargando = false;
        this.okMsg = 'Veterinario actualizado ✅';
        this.updated.emit();
        setTimeout(() => this.close.emit(), 700);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar el veterinario.';
      }
    });
  }
}
