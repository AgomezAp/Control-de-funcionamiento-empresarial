import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';
interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo cachear GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Verificar si la URL debe ser cacheada
  const shouldCache = shouldCacheUrl(req.url);
  if (!shouldCache) {
    return next(req);
  }

  const cachedResponse = cache.get(req.url);

  // Si existe en caché y no ha expirado, devolver desde caché
  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TIME) {
    console.log(`✅ Servido desde caché: ${req.url}`);
    return of(cachedResponse.response.clone());
  }

  // Si no está en caché o expiró, hacer el request y guardar en caché
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, {
          response: event.clone(),
          timestamp: Date.now(),
        });
      }
    })
  );
};

// Determinar qué URLs cachear
function shouldCacheUrl(url: string): boolean {
  const cacheableEndpoints = ['/categorias', '/areas', '/roles'];

  return cacheableEndpoints.some((endpoint) => url.includes(endpoint));
}

// Función para limpiar caché (exportar si necesitas usarla)
export function clearCache(): void {
  cache.clear();
}

// Eliminar entrada específica
export function removeFromCache(url: string): void {
  cache.delete(url);
}
