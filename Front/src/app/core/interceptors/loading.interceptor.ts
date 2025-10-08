import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { LoadingService } from '../services/loading.service';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';

let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Incrementar contador y mostrar loading
  activeRequests++;
  if (activeRequests === 1) {
    loadingService.show();
  }

  return next(req).pipe(
    tap(event => {
      // Opcional: Log de respuestas exitosas en desarrollo
      if (event instanceof HttpResponse) {
        // console.log('Response:', event);
      }
    }),
    finalize(() => {
      // Decrementar contador y ocultar loading cuando no hay requests activos
      activeRequests--;
      if (activeRequests === 0) {
        loadingService.hide();
      }
    })
  );
};