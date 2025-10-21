import { Injectable, NgZone } from '@angular/core';
import { Subject, fromEvent, merge, timer } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { TIEMPO_INACTIVIDAD_MS, EstadoPresencia } from '../models/estado-presencia.model';
import { UsuarioService } from './usuario.service';
import { AuthService } from './auth.service';

/**
 * Servicio para detectar inactividad del usuario
 * Después de 15 minutos sin actividad, cambia automáticamente el estado a "Away"
 */
@Injectable({
  providedIn: 'root'
})
export class ActividadUsuarioService {
  private inactivityTimer: any;
  private isAway = false;
  private estadoPresenciaAnterior: EstadoPresencia = EstadoPresencia.ACTIVO;

  // Observable para notificar cuando hay actividad
  private actividad$ = new Subject<void>();

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  /**
   * Iniciar monitoreo de actividad
   */
  iniciarMonitoreo(): void {
    // Eventos que indican actividad del usuario
    const eventos = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Crear observables para cada evento
    const eventosActividad = eventos.map(evento => 
      fromEvent(document, evento)
    );

    // Fusionar todos los eventos y aplicar throttle para no saturar
    this.ngZone.runOutsideAngular(() => {
      merge(...eventosActividad)
        .pipe(
          throttleTime(5000), // Máximo una actualización cada 5 segundos
          debounceTime(1000)  // Esperar 1 segundo después de la última actividad
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            this.registrarActividad();
          });
        });
    });

    // Iniciar timer de inactividad
    this.reiniciarTimerInactividad();
  }

  /**
   * Detener monitoreo de actividad
   */
  detenerMonitoreo(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  /**
   * Registrar actividad del usuario
   */
  private registrarActividad(): void {
    this.actividad$.next();

    // Si estaba Away, volver al estado anterior
    if (this.isAway) {
      this.volverDeAway();
    }

    // Actualizar actividad en el backend (solo si está autenticado)
    if (this.authService.isAuthenticated()) {
      this.usuarioService.actualizarActividad().subscribe({
        next: () => {
          // Actividad actualizada
        },
        error: (error) => {
          console.error('Error al actualizar actividad:', error);
        }
      });
    }

    // Reiniciar timer de inactividad
    this.reiniciarTimerInactividad();
  }

  /**
   * Reiniciar el timer de inactividad
   */
  private reiniciarTimerInactividad(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.cambiarAway();
    }, TIEMPO_INACTIVIDAD_MS);
  }

  /**
   * Cambiar estado a Away por inactividad
   */
  private cambiarAway(): void {
    if (!this.isAway && this.authService.isAuthenticated()) {
      const usuarioActual = this.authService.getCurrentUser();
      
      if (usuarioActual && (usuarioActual as any).estado_presencia) {
        // Guardar estado anterior
        this.estadoPresenciaAnterior = (usuarioActual as any).estado_presencia;
        
        // Solo cambiar a Away si el usuario está en Activo o Ausente
        if ([EstadoPresencia.ACTIVO, EstadoPresencia.AUSENTE].includes(this.estadoPresenciaAnterior)) {
          this.usuarioService.cambiarEstadoPresencia(EstadoPresencia.AWAY).subscribe({
            next: () => {
              this.isAway = true;
              console.log('⏰ Usuario cambiado a Away por inactividad');
            },
            error: (error) => {
              console.error('Error al cambiar a Away:', error);
            }
          });
        }
      }
    }
  }

  /**
   * Volver del estado Away cuando hay actividad
   */
  private volverDeAway(): void {
    if (this.isAway) {
      // Volver al estado anterior (Activo o Ausente)
      const estadoARestaurar = this.estadoPresenciaAnterior === EstadoPresencia.NO_MOLESTAR 
        ? EstadoPresencia.ACTIVO  // Si era No Molestar, volver a Activo
        : this.estadoPresenciaAnterior;

      this.usuarioService.cambiarEstadoPresencia(estadoARestaurar).subscribe({
        next: () => {
          this.isAway = false;
          console.log(`✅ Usuario volvió de Away a ${estadoARestaurar}`);
        },
        error: (error) => {
          console.error('Error al volver de Away:', error);
        }
      });
    }
  }

  /**
   * Observable de actividad
   */
  get actividad() {
    return this.actividad$.asObservable();
  }
}
