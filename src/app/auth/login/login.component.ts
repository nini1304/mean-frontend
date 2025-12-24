import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  }

  get f() {
    return this.loginForm.controls;
  }

  get rf() {
  return this.recoverForm.controls;
}


  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.cargando = false;
        this.successMsg = res.message || 'Login exitoso';

        const payload = this.authService.getTokenPayload(res.token);

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
}
