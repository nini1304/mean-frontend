import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { VeterinariosService } from '../veterianarios.service';


function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('contrasena')?.value;
  const confirm = group.get('confirmarContrasena')?.value;
  if (!pass || !confirm) return null;
  return pass === confirm ? null : { passwordMismatch: true };
}

function horaRangoValido(group: AbstractControl): ValidationErrors | null {
  const ini = group.get('hora_inicio')?.value;
  const fin = group.get('hora_fin')?.value;
  if (!ini || !fin) return null;

  // "HH:mm" comparación lexicográfica funciona si siempre viene 00-23 y 00-59
  return ini < fin ? null : { horaRangoInvalido: true };
}

@Component({
  selector: 'app-modal-agregar-veterinario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agregar-veterinario.component.html',
  styleUrl: './modal-agregar-veterinario.component.scss',
})
export class ModalAgregarVeterinarioComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  cargando = false;
  errorMsg = '';
  okMsg = '';

  form; // se inicializa en constructor

  constructor(
    private fb: FormBuilder,
    private veterinariosService: VeterinariosService
  ) {
    this.form = this.fb.group(
      {
        usuario: this.fb.group({
          nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
          correo: ['', [Validators.required, Validators.email]],
          numero_celular: ['', [Validators.required]],
        }),

        especialidad: ['', [Validators.required, Validators.minLength(3)]],

        contrasena: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
          ],
        ],
        confirmarContrasena: ['', [Validators.required]],

        horarios: this.fb.array([]),
      },
      { validators: [passwordsMatch] }
    );
  }

  ngOnInit(): void {
    // Arranca con 1 horario por defecto
    this.agregarHorario();
  }

  get passwordMismatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'];
  }

  get horariosArr(): FormArray {
    return this.form.get('horarios') as FormArray;
  }

  get sinHorarios(): boolean {
    return this.horariosArr.length === 0;
  }

  nuevoHorario() {
    return this.fb.group(
      {
        dia_semana: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
        hora_inicio: ['08:00', [Validators.required]],
        hora_fin: ['12:00', [Validators.required]],
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

    const payload = {
      usuario: {
        nombre_completo: raw.usuario.nombre_completo!,
        correo: raw.usuario.correo!,
        numero_celular: raw.usuario.numero_celular!,
      },
      contrasena: raw.contrasena!,
      especialidad: raw.especialidad!,
      horarios: (raw.horarios ?? []).map((h: any) => ({
        dia_semana: Number(h.dia_semana),
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
      })),
    };

    this.veterinariosService.crearCompleto(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.okMsg = 'Veterinario creado correctamente ✅';
        this.created.emit();
        setTimeout(() => this.close.emit(), 700);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo crear el veterinario.';
      },
    });
  }

  // helper para mostrar día
  diaLabel(n: number): string {
    const map: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      7: 'Domingo',
    };
    return map[n] || `Día ${n}`;
  }
}
