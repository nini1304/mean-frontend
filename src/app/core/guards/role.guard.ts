import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.getToken();
    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    const payload = auth.getTokenPayload(token);
    const rol = payload?.rol?.nombre;

    if (!rol || !rolesPermitidos.includes(rol)) {
      router.navigate(['/']); // o a una pantalla "no autorizado"
      return false;
    }

    return true;
  };
};
