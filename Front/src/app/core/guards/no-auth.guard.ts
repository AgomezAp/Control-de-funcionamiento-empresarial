import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si está autenticado, redirigir al dashboard
  if (authService.isAuthenticated() && !authService.isTokenExpired()) {
    return router.createUrlTree(['/dashboard']);
  }

  // No autenticado, permitir acceso a páginas públicas (login, registro)
  return true;
};