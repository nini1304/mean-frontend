import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {

 

constructor(private router: Router,private authService: AuthService) {}

irUsuarios() {
  this.router.navigate(['/admin/usuarios']);
}

irVeterinarios() {
  this.router.navigate(['/admin/veterinarios']);
}

irPacientes() {
  this.router.navigate(['/pacientes'], { queryParams: { returnTo: '/admin/menu' } });
}

cerrarSesion() {
  this.authService.logout();
  this.router.navigateByUrl('', { replaceUrl: true });
}



}
