import { Routes } from '@angular/router';

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

];
