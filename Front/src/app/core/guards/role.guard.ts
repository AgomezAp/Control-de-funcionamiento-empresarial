import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { MENSAJES } from '../constants/mensajes.constants';
import { RoleEnum } from '../models/role.model';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { NotificacionService } from '../services/notificacion.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacionService = inject(NotificacionService);

  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return router.createUrlTree(['/auth/login']);
  }

  // Obtener roles permitidos desde la ruta
  const allowedRoles = route.data['roles'] as RoleEnum[];

  if (!allowedRoles || allowedRoles.length === 0) {
    // Si no hay roles especificados, permitir acceso
    return true;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (allowedRoles.includes(currentUser.rol)) {
    return true;
  }

  // No tiene permiso
  notificacionService.error(MENSAJES.ERROR.NO_AUTORIZADO);
  return router.createUrlTree(['/dashboard']);
};

// Guard para rutas hijas
export const roleChildGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return roleGuard(route, state);
};
