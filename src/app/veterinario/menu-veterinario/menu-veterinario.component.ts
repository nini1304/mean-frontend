import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-menu-veterinario',
  imports: [],
  templateUrl: './menu-veterinario.component.html',
  styleUrl: './menu-veterinario.component.scss'
})
export class MenuVeterinarioComponent {

  constructor(private router: Router, private authService: AuthService) { }

  irPacientes() {
    this.router.navigate(['/pacientes'], { queryParams: { returnTo: '/veterinario/menu' } });
  }
  cerrarSesion() {
    this.authService.logout();
    this.router.navigateByUrl('', { replaceUrl: true });
  }

}
