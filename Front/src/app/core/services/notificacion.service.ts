import { Injectable } from '@angular/core';
import { StorageUtil } from '../utils/storage.util';
import { Notificacion, TipoNotificacion } from '../models/notificacion.model';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificaciones: Notificacion[] = [];
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private messageService: MessageService) {
    this.loadNotificaciones();
  }

  // Mostrar toast de éxito
  success(mensaje: string, titulo: string = 'Éxito'): void {
    this.messageService.add({
      severity: 'success',
      summary: titulo,
      detail: mensaje,
      life: 3000
    });
  }

  // Mostrar toast de error
  error(mensaje: string, titulo: string = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary: titulo,
      detail: mensaje,
      life: 5000
    });
  }

  // Mostrar toast de advertencia
  warning(mensaje: string, titulo: string = 'Advertencia'): void {
    this.messageService.add({
      severity: 'warn',
      summary: titulo,
      detail: mensaje,
      life: 4000
    });
  }

  // Mostrar toast de información
  info(mensaje: string, titulo: string = 'Información'): void {
    this.messageService.add({
      severity: 'info',
      summary: titulo,
      detail: mensaje,
      life: 3000
    });
  }

  // Agregar notificación
  add(notificacion: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): void {
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id: this.generateId(),
      fecha: new Date(),
      leida: false
    };

    this.notificaciones.unshift(nuevaNotificacion);
    this.updateNotificaciones();
    this.updateUnreadCount();
    
    // Mostrar toast
    this.showToastFromNotificacion(nuevaNotificacion);
    
    // Mostrar notificación del navegador si está permitido
    this.showBrowserNotification(nuevaNotificacion);
  }

  // Marcar como leída
  markAsRead(id: string): void {
    const notificacion = this.notificaciones.find(n => n.id === id);
    if (notificacion && !notificacion.leida) {
      notificacion.leida = true;
      this.updateNotificaciones();
      this.updateUnreadCount();
    }
  }

  // Marcar todas como leídas
  markAllAsRead(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.updateNotificaciones();
    this.updateUnreadCount();
  }

  // Eliminar notificación
  delete(id: string): void {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.updateNotificaciones();
    this.updateUnreadCount();
  }

  // Limpiar todas las notificaciones
  clear(): void {
    this.notificaciones = [];
    this.updateNotificaciones();
    this.updateUnreadCount();
  }

  // Obtener todas las notificaciones
  getAll(): Notificacion[] {
    return this.notificaciones;
  }

  // Obtener notificaciones no leídas
  getUnread(): Notificacion[] {
    return this.notificaciones.filter(n => !n.leida);
  }

  // Solicitar permiso para notificaciones del navegador
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    const permission = await Notification.requestPermission();
    StorageUtil.setItem(STORAGE_KEYS.NOTIFICATION_PERMISSION, permission);
    return permission === 'granted';
  }

  // Verificar si tiene permiso
  hasPermission(): boolean {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  // Mostrar notificación del navegador
  private showBrowserNotification(notificacion: Notificacion): void {
    if (!this.hasPermission()) return;

    const notification = new Notification(notificacion.titulo, {
      body: notificacion.mensaje,
      icon: '/assets/icons/notification-icon.png',
      badge: '/assets/icons/badge-icon.png',
      tag: notificacion.id,
      requireInteraction: notificacion.tipo === TipoNotificacion.PETICION_VENCIDA,
    });

    notification.onclick = () => {
      window.focus();
      this.markAsRead(notificacion.id);
      notification.close();
      
      // Navegar si hay peticion_id
      if (notificacion.peticion_id) {
        // Aquí podrías usar Router para navegar
        console.log('Navegar a petición:', notificacion.peticion_id);
      }
    };
  }

  // Mostrar toast según tipo de notificación
  private showToastFromNotificacion(notificacion: Notificacion): void {
    const severityMap: { [key in TipoNotificacion]: 'success' | 'info' | 'warn' | 'error' } = {
      [TipoNotificacion.NUEVA_PETICION]: 'info',
      [TipoNotificacion.PETICION_ACEPTADA]: 'success',
      [TipoNotificacion.PETICION_RESUELTA]: 'success',
      [TipoNotificacion.PETICION_VENCIDA]: 'error',
      [TipoNotificacion.NUEVO_COMENTARIO]: 'info',
      [TipoNotificacion.CAMBIO_ESTADO]: 'info',
      [TipoNotificacion.ASIGNACION]: 'info',
    };

    this.messageService.add({
      severity: severityMap[notificacion.tipo],
      summary: notificacion.titulo,
      detail: notificacion.mensaje,
      life: 4000
    });
  }

  // Actualizar subject de notificaciones
  private updateNotificaciones(): void {
    this.notificacionesSubject.next([...this.notificaciones]);
    this.saveNotificaciones();
  }

  // Actualizar contador de no leídas
  private updateUnreadCount(): void {
    const count = this.notificaciones.filter(n => !n.leida).length;
    this.unreadCountSubject.next(count);
  }

  // Guardar notificaciones en localStorage
  private saveNotificaciones(): void {
    // Guardar solo las últimas 50 notificaciones
    const toSave = this.notificaciones.slice(0, 50);
    StorageUtil.setItem('notificaciones', toSave);
  }

  // Cargar notificaciones desde localStorage
  private loadNotificaciones(): void {
    const saved = StorageUtil.getItem<Notificacion[]>('notificaciones');
    if (saved && Array.isArray(saved)) {
      this.notificaciones = saved;
      this.updateNotificaciones();
      this.updateUnreadCount();
    }
  }

  // Generar ID único
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}