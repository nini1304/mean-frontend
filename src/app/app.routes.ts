import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AgendaComponent } from './agenda/agenda/agenda.component';

export const routes: Routes = [
  {
	path: '',
	loadComponent: () =>
	  import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
	path: 'admin/menu',
  canActivate: [authGuard, roleGuard(['ADMIN'])],
	loadComponent: () =>
	import('./admin/menu/menu.component').then(m => m.MenuComponent),
  },
   {
	path: 'veterinario/menu',
  canActivate: [authGuard, roleGuard(['VETERINARIO'])],
	loadComponent: () =>
	import('./veterinario/menu-veterinario/menu-veterinario.component').then(m => m.MenuVeterinarioComponent),
  },
  {
    path: 'admin/usuarios',
    canActivate: [authGuard, roleGuard(['ADMIN'])], // ajusta si tu rol se llama diferente
    loadComponent: () =>
      import('./admin/usuarios/usuarios.component').then(m => m.UsuariosComponent),
  },
  {
    path: 'admin/veterinarios',
    canActivate: [authGuard, roleGuard(['ADMIN'])], // ajusta si tu rol se llama diferente
    loadComponent: () =>
      import('./veterinario/veterinarios/veterinarios.component').then(m => m.VeterinariosComponent),
  },
  {
  path: 'recepcionista/menu',
  canActivate: [authGuard, roleGuard(['RECEPCIONISTA'])],
  loadComponent: () =>
    import('./recepcionista/menu-recepcionista/menu-recepcionista.component').then(m => m.MenuRecepcionistaComponent),
},

{
  path: 'pacientes',
  canActivate: [authGuard, roleGuard(['ADMIN','RECEPCIONISTA', 'VETERINARIO'])],
  loadComponent: () =>
    import('./pacientes/listado-pacientes/listado-pacientes.component')
      .then(m => m.ListadoPacientesComponent),
},
{
  path: 'historial/:idMascota',
  canActivate: [authGuard, roleGuard(['VETERINARIO'])],
  loadComponent: () =>
    import('./historial/historial-clinico/historial-clinico.component')
      .then(m => m.HistorialClinicoComponent),
},
{ path: 'agenda', component: AgendaComponent },





];
