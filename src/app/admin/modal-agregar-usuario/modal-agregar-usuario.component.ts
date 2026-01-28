import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RolesService, RolDto } from '../roles.service';
import { UsersService } from '../users.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('contrasena')?.value;
  const confirm = group.get('confirmarContrasena')?.value;

  // si todavía no se llena, no marques error
  if (!pass || !confirm) return null;

  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-modal-agregar-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-agregar-usuario.component.html',
  styleUrl: './modal-agregar-usuario.component.scss',
})
export class ModalAgregarUsuarioComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

   form;

  roles: RolDto[] = [];

  cargando = false;
  errorMsg = '';
  okMsg = '';

 

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private usersService: UsersService
  ) {
    
    this.form = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      numero_celular: ['', [Validators.required]],
      id_rol: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(8),Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)]],
      confirmarContrasena: ['', [Validators.required]],
    },
  { validators: [passwordsMatch] });
    
  
  }

  ngOnInit(): void {
    this.rolesService.listarSinVeterinario().subscribe({
      next: (res) => (this.roles = res ?? []),
      error: () => (this.roles = []),
    });
  }

  cancelar() {
    this.close.emit();
  }

   get passwordMismatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'];
  }

 

  submit() {
    this.errorMsg = '';
    this.okMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Completa los campos obligatorios.';
      return;
    }

    this.cargando = true;

    const raw = this.form.getRawValue();

    // ✅ armamos el payload según el endpoint /crear-contrasena
    const payload = {
      nombre_completo: raw.nombre_completo!,
      correo: raw.correo!,
      numero_celular: raw.numero_celular!,
      id_rol: raw.id_rol!,
      contrasena: raw.contrasena!,
    };

    this.usersService.crearConContrasena(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.okMsg = 'Usuario creado correctamente ✅';
        this.created.emit();
        setTimeout(() => this.close.emit(), 700);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo crear el usuario.';
      },
    });
  }
}
