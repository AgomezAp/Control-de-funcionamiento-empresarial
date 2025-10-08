import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';
import { PermissionUtil } from '../utils/permission.util';
import { MENSAJES } from '../constants/mensajes.constants';

export const permissionGuard: CanActivateFn = (
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

  // Obtener módulo y acción requeridos desde la ruta
  const requiredModule = route.data['module'] as string;
  const requiredAction = route.data['action'] as string;

  if (!requiredModule || !requiredAction) {
    // Si no hay módulo/acción especificados, permitir acceso
    return true;
  }

  // Verificar si el usuario tiene el permiso
  if (PermissionUtil.hasPermission(currentUser.rol, requiredModule, requiredAction)) {
    return true;
  }

  // No tiene permiso
  notificacionService.error(MENSAJES.ERROR.NO_AUTORIZADO);
  return router.createUrlTree(['/dashboard']);
};
