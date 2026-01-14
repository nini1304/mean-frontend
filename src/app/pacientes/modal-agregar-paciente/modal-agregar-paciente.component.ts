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

  filtroCliente = '';

  form: FormGroup;

  constructor(private fb: FormBuilder, private pacientesService: PacientesService) {
    this.form = this.fb.group({
      modo: ['EXISTENTE', Validators.required], // EXISTENTE | NUEVO

      // EXISTENTE
      idUsuario: [''],

      // NUEVO
      dueno: this.fb.group({
        nombre_completo: [''],
        correo: [''],
        numero_celular: [''],
      }),
      contrasena: [''],

      cantidadMascotas: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      mascotas: this.fb.array([]),
    });
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

      if (m === 'EXISTENTE') {
        idUsuario?.setValidators([Validators.required]);
        contrasena?.clearValidators();

        // dueño no requerido
        this.setDuenoValidators(false);
      } else {
        idUsuario?.clearValidators();
        contrasena?.setValidators([Validators.required, Validators.minLength(6)]);

        // dueño requerido
        this.setDuenoValidators(true);
      }

      idUsuario?.updateValueAndValidity();
      contrasena?.updateValueAndValidity();
    });

    // aplicar estado inicial
    if (this.modo === 'NUEVO') this.setDuenoValidators(true);
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
      edad: [0, [Validators.required, Validators.min(0)]],
      peso: [0, [Validators.required, Validators.min(0)]],
      sexo: ['MACHO', [Validators.required]],
      raza: ['', [Validators.required]],
    });
  }

  seleccionarCliente(c: ClienteActivoDto) {
    this.form.patchValue({ idUsuario: c._id });
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
