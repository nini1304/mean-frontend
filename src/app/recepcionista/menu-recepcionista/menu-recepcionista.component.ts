import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-menu-recepcionista',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu-recepcionista.component.html',
  styleUrl: './menu-recepcionista.component.scss'
})
export class MenuRecepcionistaComponent {

  constructor(private router: Router,private authService: AuthService) {}

  irPacientes() {
  this.router.navigate(['/pacientes'], { queryParams: { returnTo: '/recepcionista/menu' } });
}
cerrarSesion() {
  this.authService.logout();
  this.router.navigateByUrl('', { replaceUrl: true });
}

}
