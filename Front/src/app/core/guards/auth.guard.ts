import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { MENSAJES } from '../constants/mensajes.constants';
import { NotificacionService } from '../services/notificacion.service';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacionService = inject(NotificacionService);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    // Verificar si el token no ha expirado
    if (!authService.isTokenExpired()) {
      return true;
    } else {
      // Token expirado
      notificacionService.error(MENSAJES.ERROR.TOKEN_EXPIRADO);
      authService.logout();
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }
  }

  // No autenticado, redirigir a login
  notificacionService.warning('Debes iniciar sesión para acceder');
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Guard para rutas hijas
export const authChildGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return authGuard(route, state);
};