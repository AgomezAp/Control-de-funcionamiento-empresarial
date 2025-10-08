import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionService } from '../services/notificacion.service';
import { catchError, throwError } from 'rxjs';
import { MENSAJES } from '../constants/mensajes.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificacionService = inject(NotificacionService);

  // Obtener token
  const token = authService.getToken();

  // Clonar request y agregar token si existe
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  // Continuar con el request y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido
        notificacionService.error(MENSAJES.ERROR.TOKEN_EXPIRADO);
        authService.logout();
        router.navigate(['/auth/login']);
      }

      if (error.status === 403) {
        // Sin permisos
        notificacionService.error(MENSAJES.ERROR.NO_AUTORIZADO);
      }

      return throwError(() => error);
    })
  );
};
