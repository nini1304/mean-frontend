import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
	path: '',
	loadComponent: () =>
	  import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
	path: 'login',
	loadComponent: () =>
	  import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
	path: 'admin/menu',
	loadComponent: () =>
	import('./admin/menu/menu.component').then(m => m.MenuComponent),
  },
  {
  path: 'recepcionista/menu',
  loadComponent: () =>
    import('./recepcionista/menu-recepcionista/menu-recepcionista.component').then(m => m.MenuRecepcionistaComponent),
},

{
  path: 'pacientes',
  canActivate: [authGuard, roleGuard(['RECEPCIONISTA'])],
  loadComponent: () =>
    import('./pacientes/listado-pacientes/listado-pacientes.component')
      .then(m => m.ListadoPacientesComponent),
},
{
  path: 'historial/:idMascota',
  canActivate: [authGuard, roleGuard(['RECEPCIONISTA'])],
  loadComponent: () =>
    import('./historial/historial-clinico/historial-clinico.component')
      .then(m => m.HistorialClinicoComponent),
},





];
