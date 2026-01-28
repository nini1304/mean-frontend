import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService, RolDto } from '../roles.service';
import { UsersService, UsuarioDto } from '../users.service';

@Component({
  selector: 'app-modal-editar-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-usuario.component.html',
  styleUrl: './modal-editar-usuario.component.scss',
})
export class ModalEditarUsuarioComponent implements OnInit {
  @Input({ required: true }) usuario!: UsuarioDto;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  roles: RolDto[] = [];

  cargando = false;
  errorMsg = '';
  okMsg = '';

 form; // ✅ se declara, pero se crea en el constructor

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private usersService: UsersService
  ) {
    // ✅ aquí ya existe fb
    this.form = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      numero_celular: ['', [Validators.required]],
      id_rol: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // 1) cargar roles
    this.rolesService.listarSinVeterinario().subscribe({
      next: (res) => (this.roles = res ?? []),
      error: () => (this.roles = []),
    });

    // 2) precargar datos del usuario en el form
    const idRol = (this.usuario?.id_rol as any)?._id ?? ''; // por si viene como objeto
    this.form.patchValue({
      nombre_completo: this.usuario?.nombre_completo ?? '',
      correo: this.usuario?.correo ?? '',
      numero_celular: this.usuario?.numero_celular ?? '',
      id_rol: idRol,
    });
  }

  cancelar() {
    this.close.emit();
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

    const payload = {
      nombre_completo: raw.nombre_completo!,
      correo: raw.correo!,
      numero_celular: raw.numero_celular!,
      id_rol: raw.id_rol!,
    };

    this.usersService.actualizar(this.usuario._id, payload).subscribe({
      next: () => {
        this.cargando = false;
        this.okMsg = 'Usuario actualizado correctamente ✅';
        this.updated.emit();
        setTimeout(() => this.close.emit(), 700);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo actualizar el usuario.';
      },
    });
  }
}
