import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PacientesService, ClienteActivoDto, TipoMascotaDto } from '../paciente.service';

type Modo = 'EXISTENTE' | 'NUEVO';

@Component({
  selector: 'app-modal-agregar-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-agregar-paciente.component.html',
  styleUrl: './modal-agregar-paciente.component.scss'
})
export class ModalAgregarPacienteComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  cargando = false;
  errorMsg = '';
  okMsg = '';

  clientes: ClienteActivoDto[] = [];
  tiposMascota: TipoMascotaDto[] = [];

  showPassword = false;
  showPassword2 = false;

  filtroCliente = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private pacientesService: PacientesService) {
    this.form = this.fb.group(
      {
        modo: ['EXISTENTE', Validators.required],
        idUsuario: [''],

        dueno: this.fb.group({
          nombre_completo: [''],
          correo: [''],
          numero_celular: [''],
        }),

        contrasena: [''],
        confirmar_contrasena: [''],

        cantidadMascotas: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
        mascotas: this.fb.array([]),
      },
      { validators: [this.passwordsMatchValidator] }
    );

  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.setCantidadMascotas(1);
    this.configurarValidacionesPorModo();
  }

  mascotaGroupAt(i: number): FormGroup {
    return this.mascotasFA.at(i) as FormGroup;
  }


  get modo(): Modo {
    return this.form.get('modo')?.value as Modo;
  }

  get mascotasFA(): FormArray {
    return this.form.get('mascotas') as FormArray;
  }

  get duenoFG(): FormGroup {
    return this.form.get('dueno') as FormGroup;
  }

  private passwordsMatchValidator(group: AbstractControl) {
    const a = group.get('contrasena')?.value;
    const b = group.get('confirmar_contrasena')?.value;

    // si aún no escribe, no molestamos
    if (!a || !b) return null;

    return a === b ? null : { passwordsMismatch: true };
  }

  // Para mostrar checks en UI
  passwordRuleState() {
    const v: string = this.form.get('contrasena')?.value || '';
    return {
      len: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      num: /\d/.test(v),
      special: /[^A-Za-z0-9]/.test(v),
    };
  }

  clientesFiltrados(): ClienteActivoDto[] {
    const q = this.filtroCliente.trim().toLowerCase();
    if (!q) return this.clientes;
    return this.clientes.filter(c =>
      (c.nombre_completo || '').toLowerCase().includes(q) ||
      (c.correo || '').toLowerCase().includes(q) ||
      (c.numero_celular || '').toString().includes(q)
    );
  }

  private cargarCatalogos() {
    this.pacientesService.listarClientesActivos().subscribe({
      next: (res) => (this.clientes = res ?? []),
      error: () => (this.clientes = []),
    });

    this.pacientesService.listarTiposMascota().subscribe({
      next: (res) => (this.tiposMascota = res ?? []),
      error: () => (this.tiposMascota = []),
    });
  }

  private configurarValidacionesPorModo() {
  this.form.get('modo')?.valueChanges.subscribe((m: Modo) => {
    this.errorMsg = '';
    this.okMsg = '';

    // limpiar selección
    this.form.patchValue({ idUsuario: '' });

    const idUsuario = this.form.get('idUsuario');
    const contrasena = this.form.get('contrasena');
    const confirmar = this.form.get('confirmar_contrasena');

    if (m === 'EXISTENTE') {
      idUsuario?.setValidators([Validators.required]);

      contrasena?.clearValidators();
      confirmar?.clearValidators();

      // limpiar campos password
      this.form.patchValue(
        { contrasena: '', confirmar_contrasena: '' },
        { emitEvent: false }
      );

      // dueño no requerido
      this.setDuenoValidators(false);
    } else {
      idUsuario?.clearValidators();

      contrasena?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
      ]);

      confirmar?.setValidators([Validators.required]);

      // dueño requerido
      this.setDuenoValidators(true);
    }

    idUsuario?.updateValueAndValidity();
    contrasena?.updateValueAndValidity();
    confirmar?.updateValueAndValidity();

    // importante para recalcular el validator de "passwordsMismatch"
    this.form.updateValueAndValidity({ emitEvent: false });
  });

  // aplicar estado inicial
  if (this.modo === 'NUEVO') {
    this.setDuenoValidators(true);

    // y aplica validaciones iniciales a password también
    const contrasena = this.form.get('contrasena');
    const confirmar = this.form.get('confirmar_contrasena');

    contrasena?.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
    ]);
    confirmar?.setValidators([Validators.required]);

    contrasena?.updateValueAndValidity();
    confirmar?.updateValueAndValidity();
    this.form.updateValueAndValidity({ emitEvent: false });
  }
}


  private setDuenoValidators(required: boolean) {
    const nombre = this.duenoFG.get('nombre_completo');
    const correo = this.duenoFG.get('correo');
    const celular = this.duenoFG.get('numero_celular');

    if (required) {
      nombre?.setValidators([Validators.required, Validators.minLength(3)]);
      correo?.setValidators([Validators.required, Validators.email]);
      celular?.setValidators([Validators.required]);
    } else {
      nombre?.clearValidators();
      correo?.clearValidators();
      celular?.clearValidators();
    }

    nombre?.updateValueAndValidity();
    correo?.updateValueAndValidity();
    celular?.updateValueAndValidity();
  }

  onCantidadMascotasChange() {
    const n = Number(this.form.value.cantidadMascotas || 1);
    this.setCantidadMascotas(n);
  }

  private setCantidadMascotas(n: number) {
    const cantidad = Math.max(1, Math.min(10, n || 1));
    this.form.patchValue({ cantidadMascotas: cantidad }, { emitEvent: false });

    // ajustar FormArray
    while (this.mascotasFA.length < cantidad) {
      this.mascotasFA.push(this.crearMascotaFG());
    }
    while (this.mascotasFA.length > cantidad) {
      this.mascotasFA.removeAt(this.mascotasFA.length - 1);
    }
  }

  private crearMascotaFG(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      tipo_mascota: ['', [Validators.required]], // id tipo mascota
      edad: ['', [Validators.required, this.edadValidator()]],
      peso: [0, [Validators.required, Validators.min(0)]],
      sexo: ['MACHO', [Validators.required]],
      raza: ['', [Validators.required]],
    });
  }

  seleccionarCliente(c: ClienteActivoDto) {
    this.form.patchValue({ idUsuario: c._id });
  }

  edadValidator() {
    // acepta: "4 años", "4 anios", "6 meses"
    const re = /^\s*(\d+)\s*(años|anos|meses)\s*$/i;

    return (control: AbstractControl) => {
      const v = (control.value ?? '').toString().trim().toLowerCase();
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

    // marca todo
    this.form.markAllAsTouched();
    this.mascotasFA.controls.forEach(c => c.markAllAsTouched());

    if (this.form.invalid) {
      this.errorMsg = 'Revisa los campos obligatorios.';
      return;
    }

    this.cargando = true;

    const mascotas = this.mascotasFA.value;

    if (this.modo === 'EXISTENTE') {
      const idUsuario = this.form.value.idUsuario;
      this.pacientesService.registrarMascotasAUsuario(idUsuario, { mascotas }).subscribe({
        next: (res) => {
          this.cargando = false;
          this.okMsg = res?.message || 'Mascotas registradas correctamente';
          this.created.emit();
          this.close.emit();
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err?.error?.message || 'Error al registrar mascotas.';
        },
      });
    } else {
      const body = {
        dueno: this.form.value.dueno,
        contrasena: this.form.value.contrasena,
        mascotas,
      };

      this.pacientesService.crearPaciente(body).subscribe({
        next: (res) => {
          this.cargando = false;
          this.okMsg = res?.message || 'Registro creado correctamente';
          this.created.emit();
          this.close.emit();
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err?.error?.message || 'Error al crear paciente.';
        },
      });
    }
  }

  cancelar() {
    this.close.emit();
  }

  trackByIndex(i: number) {
    return i;
  }
}
