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
  cargando = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
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
    console.log('Recuperar contraseña');
  }
}
