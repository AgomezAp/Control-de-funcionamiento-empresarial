import { Injectable, Injector } from '@angular/core';
import { Notificacion, TipoNotificacion } from '../models/notificacion.model';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { NotificacionApiService } from './notificacion-api.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificaciones: Notificacion[] = [];
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notificacionApiService!: NotificacionApiService;
  private websocketService!: WebsocketService;
  private messageService!: MessageService;

  constructor(private injector: Injector) {
    // Lazy initialization para evitar dependencias circulares
    setTimeout(() => {
      this.notificacionApiService = this.injector.get(NotificacionApiService);
      this.websocketService = this.injector.get(WebsocketService);
      this.messageService = this.injector.get(MessageService);
      
      this.initializeWebSocketListeners();
      this.loadNotificaciones();
    });
  }

  private initializeWebSocketListeners(): void {
    if (!this.websocketService) return;
    
    this.websocketService.onNuevaNotificacion().subscribe((data) => {
      console.log('Nueva notificacion WebSocket:', data);
      const notificacion = data.notificacion as Notificacion;
      this.agregarNotificacion(notificacion);
      this.showToastFromNotificacion(notificacion);
      this.showBrowserNotification(notificacion);
    });

    this.websocketService.onContadorNotificaciones().subscribe((count) => {
      console.log('Contador actualizado:', count);
      this.unreadCountSubject.next(count);
    });
  }

  private agregarNotificacion(notificacion: Notificacion): void {
    this.notificaciones.unshift(notificacion);
    this.updateNotificaciones();
  }

  success(mensaje: string, titulo: string = 'Exito'): void {
    if (!this.messageService) return;
    this.messageService.add({
      severity: 'success',
      summary: titulo,
      detail: mensaje,
      life: 3000
    });
  }

  error(mensaje: string, titulo: string = 'Error'): void {
    if (!this.messageService) return;
    this.messageService.add({
      severity: 'error',
      summary: titulo,
      detail: mensaje,
      life: 5000
    });
  }

  warning(mensaje: string, titulo: string = 'Advertencia'): void {
    if (!this.messageService) return;
    this.messageService.add({
      severity: 'warn',
      summary: titulo,
      detail: mensaje,
      life: 4000
    });
  }

  info(mensaje: string, titulo: string = 'Informacion'): void {
    if (!this.messageService) return;
    this.messageService.add({
      severity: 'info',
      summary: titulo,
      detail: mensaje,
      life: 3000
    });
  }

  loadNotificaciones(): void {
    if (!this.notificacionApiService) return;
    this.notificacionApiService.getAll({ limit: 50 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificaciones = response.data;
          this.updateNotificaciones();
          this.loadUnreadCount();
        }
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
      }
    });
  }

  loadUnreadCount(): void {
    if (!this.notificacionApiService) return;
    this.notificacionApiService.getUnreadCount().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.unreadCountSubject.next(response.data.count);
        }
      },
      error: (error) => {
        console.error('Error al cargar contador de notificaciones:', error);
      }
    });
  }

  markAsRead(id: number): void {
    if (!this.notificacionApiService) return;
    this.notificacionApiService.markAsRead(id).subscribe({
      next: (response) => {
        if (response.success) {
          const notificacion = this.notificaciones.find(n => n.id === id);
          if (notificacion) {
            notificacion.leida = true;
            this.updateNotificaciones();
            this.loadUnreadCount();
          }
        }
      },
      error: (error) => {
        console.error('Error al marcar notificacion como leida:', error);
        this.error('No se pudo marcar la notificacion como leida');
      }
    });
  }

  markAllAsRead(): void {
    if (!this.notificacionApiService) return;
    this.notificacionApiService.markAllAsRead().subscribe({
      next: (response) => {
        if (response.success) {
          this.notificaciones.forEach(n => n.leida = true);
          this.updateNotificaciones();
          this.unreadCountSubject.next(0);
          this.success('Todas las notificaciones marcadas como leidas');
        }
      },
      error: (error) => {
        console.error('Error al marcar todas como leidas:', error);
        this.error('No se pudieron marcar las notificaciones como leidas');
      }
    });
  }

  delete(id: number): void {
    if (!this.notificacionApiService) return;
    this.notificacionApiService.delete(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificaciones = this.notificaciones.filter(n => n.id !== id);
          this.updateNotificaciones();
          this.loadUnreadCount();
          this.success('Notificacion eliminada');
        }
      },
      error: (error) => {
        console.error('Error al eliminar notificacion:', error);
        this.error('No se pudo eliminar la notificacion');
      }
    });
  }

  clear(): void {
    if (!this.notificacionApiService) return;
    this.notificacionApiService.deleteAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.notificaciones = [];
          this.updateNotificaciones();
          this.unreadCountSubject.next(0);
          this.success('Todas las notificaciones eliminadas');
        }
      },
      error: (error) => {
        console.error('Error al eliminar todas las notificaciones:', error);
        this.error('No se pudieron eliminar las notificaciones');
      }
    });
  }

  getAll(): Notificacion[] {
    return this.notificaciones;
  }

  getUnread(): Notificacion[] {
    return this.notificaciones.filter(n => !n.leida);
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  hasPermission(): boolean {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  private showBrowserNotification(notificacion: Notificacion): void {
    if (!this.hasPermission()) return;

    const notification = new Notification(notificacion.titulo, {
      body: notificacion.mensaje,
      icon: '/assets/icons/notification-icon.png',
      badge: '/assets/icons/badge-icon.png',
      tag: notificacion.id.toString(),
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      this.markAsRead(notificacion.id);
      notification.close();
      
      if (notificacion.peticion_id) {
        console.log('Navegar a peticion:', notificacion.peticion_id);
      }
    };
  }

  private showToastFromNotificacion(notificacion: Notificacion): void {
    if (!this.messageService) return;
    
    const severityMap: { [key in TipoNotificacion]: 'success' | 'info' | 'warn' | 'error' } = {
      [TipoNotificacion.ASIGNACION]: 'info',
      [TipoNotificacion.CAMBIO_ESTADO]: 'info',
      [TipoNotificacion.COMENTARIO]: 'info',
      [TipoNotificacion.MENCION]: 'warn',
      [TipoNotificacion.SISTEMA]: 'info',
    };

    this.messageService.add({
      severity: severityMap[notificacion.tipo],
      summary: notificacion.titulo,
      detail: notificacion.mensaje,
      life: 4000
    });
  }

  private updateNotificaciones(): void {
    this.notificacionesSubject.next([...this.notificaciones]);
  }
}
