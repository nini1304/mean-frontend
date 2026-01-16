import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // opcional: validar expiración
  const payload = auth.getTokenPayload(token);
  if (!payload) {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
