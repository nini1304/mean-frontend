import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	loginForm: FormGroup;
	recoverForm: FormGroup;
	cargando = false;
	errorMsg = '';
	successMsg = '';

	showRecoverModal = false;
	cargandoReset = false;
	resetMsg = '';
	resetErrorMsg = '';

	changePasswordForm: FormGroup;
showChangePasswordModal = false;
cargandoChange = false;
changeMsg = '';
changeErrorMsg = '';
rolActual: string | null = null;


	tempCurrentPassword: string | null = null;


	 constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router
	) {
		this.loginForm = this.fb.group({
			correo: ['', [Validators.required, Validators.email]],
			contrasena: ['', [Validators.required]],
		});

		this.recoverForm = this.fb.group({
			correo: ['', [Validators.required, Validators.email]],
		});
		
		this.changePasswordForm = this.fb.group({
		contrasena_nueva: ['', [Validators.required, Validators.minLength(6)]],
		contrasena_nueva_2: ['', [Validators.required]],
	},
	{ validators: this.passwordsMatchValidator }
);

	}

	get f() {
		return this.loginForm.controls;
	}

	get rf() {
	return this.recoverForm.controls;
}

get cpf() {
	return this.changePasswordForm.controls;
}


private passwordsMatchValidator(group: AbstractControl) {
	const a = group.get('contrasena_nueva')?.value;
	const b = group.get('contrasena_nueva_2')?.value;
	if (!a || !b) return null;
	return a === b ? null : { passwordsMismatch: true };
}



	onSubmit() {
		this.errorMsg = '';
		this.successMsg = '';

		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		this.tempCurrentPassword = this.loginForm.value.contrasena;

		this.cargando = true;

		this.authService.login(this.loginForm.value).subscribe({
			next: (res) => {
				this.cargando = false;
				this.successMsg = res.message || 'Login exitoso';

				const payload = this.authService.getTokenPayload(res.token);


				 const requiereCambio = !!res.requiereCambioContrasena;

					if (requiereCambio) {
						// abrir modal para cambiar contraseña
						this.changeMsg = '';
						this.changeErrorMsg = '';
						this.changePasswordForm.reset();
						this.showChangePasswordModal = true;
						return; // NO redirigir todavía
					}


				if (payload?.rol?.nombre === 'ADMIN') {
					// 👉 admin: ir al menú de administrador
					this.router.navigate(['/admin/menu']);
				} else {
					// 👉 otro rol: por ahora lo mandamos al home
					this.router.navigate(['/']);
				}
			},
			error: (err) => {
				this.cargando = false;
				this.errorMsg = err?.error?.message || 'Error al iniciar sesión';
			},
		});
	}

	onRecoverPassword() {
		this.resetMsg = '';
		this.resetErrorMsg = '';
		this.recoverForm.reset();
		this.showRecoverModal = true;
	}

	closeRecoverModal() {
		this.showRecoverModal = false;
	}

	submitRecoverPassword() {
		this.resetMsg = '';
		this.resetErrorMsg = '';

		if (this.recoverForm.invalid) {
			this.recoverForm.markAllAsTouched();
			return;
		}

		this.cargandoReset = true;
		const correo = this.recoverForm.value.correo;

		this.authService.forgotPassword(correo).subscribe({
			next: (res) => {
				this.cargandoReset = false;
				this.resetMsg =
					res.message ||
					'Si el correo existe en el sistema, se ha enviado una contraseña temporal.';
			},
			error: () => {
				this.cargandoReset = false;
				this.resetErrorMsg = 'Ocurrió un error al procesar la solicitud.';
			},
		});
	}

	closeChangePasswordModal() {
  this.showChangePasswordModal = false;
}

submitChangePassword() {
  this.changeMsg = '';
  this.changeErrorMsg = '';

  if (this.changePasswordForm.invalid) {
    this.changePasswordForm.markAllAsTouched();
    return;
  }

  if (!this.tempCurrentPassword) {
    this.changeErrorMsg = 'No se pudo recuperar la contraseña actual. Vuelva a iniciar sesión.';
    return;
  }

  const nueva = this.changePasswordForm.value.contrasena_nueva;

  this.cargandoChange = true;

  this.authService.changePassword(this.tempCurrentPassword, nueva).subscribe({
    next: (res) => {
      this.cargandoChange = false;
      this.changeMsg = res.message || 'Contraseña cambiada correctamente';
      this.showChangePasswordModal = false;

      // limpiar la contraseña en memoria
      this.tempCurrentPassword = null;

      // redirigir según rol
      if (this.rolActual === 'ADMIN') {
        this.router.navigate(['/admin/menu']);
      } else {
        this.router.navigate(['/']);
      }
    },
    error: (err) => {
      this.cargandoChange = false;
      this.changeErrorMsg =
        err?.error?.message || 'Ocurrió un error al cambiar la contraseña.';
    },
  });
}

}
