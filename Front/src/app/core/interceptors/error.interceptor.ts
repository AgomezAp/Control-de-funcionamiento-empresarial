import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { MENSAJES } from '../constants/mensajes.constants';
import { catchError, retry, throwError } from 'rxjs';
import { NotificacionService } from '../services/notificacion.service';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificacionService = inject(NotificacionService);

  return next(req).pipe(
    // Reintentar una vez en caso de error de red
    retry({
      count: 1,
      delay: (error: HttpErrorResponse) => {
        // Solo reintentar errores de red (0) o 5xx
        if (error.status === 0 || error.status >= 500) {
          return throwError(() => error);
        }
        throw error;
      },
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = MENSAJES.ERROR.GENERIC;

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        console.error('Error del cliente:', error.error.message);
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        console.error(
          `Backend retornó código ${error.status}, ` +
            `mensaje: ${error.message}`
        );

        // Manejar errores específicos
        switch (error.status) {
          case 0:
            errorMessage = MENSAJES.ERROR.SIN_CONEXION;
            break;
          case 400:
            errorMessage =
              error.error?.message || MENSAJES.ERROR.CAMPOS_REQUERIDOS;
            break;
          case 401:
            errorMessage = error.error?.message || MENSAJES.ERROR.NO_AUTORIZADO;
            break;
          case 403:
            errorMessage = error.error?.message || MENSAJES.ERROR.NO_AUTORIZADO;
            break;
          case 404:
            errorMessage = error.error?.message || 'Recurso no encontrado';
            break;
          case 422:
            // Errores de validación
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              const validationErrors = error.error.errors
                .map((e: any) => Object.values(e).join(', '))
                .join('; ');
              errorMessage = validationErrors;
            } else {
              errorMessage =
                error.error?.message || MENSAJES.ERROR.CAMPOS_REQUERIDOS;
            }
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = error.error?.message || MENSAJES.ERROR.GENERIC;
        }
      }

      // Mostrar notificación de error (excepto para 401 que ya lo maneja authInterceptor)
      if (error.status !== 401) {
        notificacionService.error(errorMessage);
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        error: error.error,
      }));
    })
  );
};
