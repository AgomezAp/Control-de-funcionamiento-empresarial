import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WS_EVENTS } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private connected$ = new Subject<boolean>();
  
  // Subjects para cada tipo de evento
  private nuevaPeticion$ = new Subject<any>();
  private cambioEstado$ = new Subject<any>();
  private nuevoComentario$ = new Subject<any>();
  private peticionAceptada$ = new Subject<any>();
  private peticionVencida$ = new Subject<any>();
  private usuarioOnline$ = new Subject<any>();
  private usuarioOffline$ = new Subject<any>();
  private usuarioEscribiendo$ = new Subject<any>();
  private nuevaNotificacion$ = new Subject<any>();
  private contadorNotificaciones$ = new Subject<number>();
  private usuariosConectados$ = new Subject<number[]>(); // Lista de IDs de usuarios conectados
  private cambioEstadoPresencia$ = new Subject<any>(); // Cambio de estado de presencia

  constructor(private authService: AuthService) {}

  // Conectar al servidor WebSocket
  connect(): void {
    const token = this.authService.getToken();
    
    if (!token || this.socket?.connected) {
      return;
    }

    this.socket = io(environment.wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  // Desconectar
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected$.next(false);
    }
  }

  // Configurar listeners de eventos
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      this.connected$.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Error de conexión WebSocket:', error);
    });

    // Eventos del servidor
    this.socket.on(WS_EVENTS.NUEVA_PETICION, (data: any) => {
      this.nuevaPeticion$.next(data);
    });

    this.socket.on(WS_EVENTS.CAMBIO_ESTADO, (data: any) => {
      this.cambioEstado$.next(data);
    });

    this.socket.on(WS_EVENTS.NUEVO_COMENTARIO, (data: any) => {
      this.nuevoComentario$.next(data);
    });

    this.socket.on(WS_EVENTS.PETICION_ACEPTADA, (data: any) => {
      this.peticionAceptada$.next(data);
    });

    this.socket.on(WS_EVENTS.PETICION_VENCIDA, (data: any) => {
      this.peticionVencida$.next(data);
    });

    this.socket.on(WS_EVENTS.USUARIO_ONLINE, (data: any) => {
      this.usuarioOnline$.next(data);
    });

    this.socket.on(WS_EVENTS.USUARIO_OFFLINE, (data: any) => {
      this.usuarioOffline$.next(data);
    });

    this.socket.on(WS_EVENTS.USUARIO_ESCRIBIENDO, (data: any) => {
      this.usuarioEscribiendo$.next(data);
    });

    // Eventos de notificaciones
    this.socket.on(WS_EVENTS.NUEVA_NOTIFICACION, (data: any) => {
      console.log('📬 Nueva notificación recibida:', data);
      this.nuevaNotificacion$.next(data);
    });

    this.socket.on(WS_EVENTS.CONTADOR_NOTIFICACIONES, (count: number) => {
      console.log('🔔 Contador de notificaciones actualizado:', count);
      this.contadorNotificaciones$.next(count);
    });

    // Evento de usuarios conectados
    this.socket.on('usuariosConectados', (data: { usuarios: number[], total: number }) => {
      console.log('👥 Usuarios conectados actualizados:', data.total, 'usuarios');
      this.usuariosConectados$.next(data.usuarios);
    });

    // Evento de cambio de estado de presencia
    this.socket.on('cambioEstadoPresencia', (data: { userId: number, estadoPresencia: string }) => {
      console.log('🔄 Cambio de estado de presencia:', data);
      this.cambioEstadoPresencia$.next(data);
    });
  }

  // Emitir eventos al servidor
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Unirse a una sala (room)
  joinRoom(room: string): void {
    this.emit(WS_EVENTS.JOIN_ROOM, { room });
  }

  // Salir de una sala
  leaveRoom(room: string): void {
    this.emit(WS_EVENTS.LEAVE_ROOM, { room });
  }

  // Notificar que el usuario está escribiendo
  typing(peticionId: number): void {
    this.emit(WS_EVENTS.TYPING, { peticionId });
  }

  // Notificar que el usuario dejó de escribir
  stopTyping(peticionId: number): void {
    this.emit(WS_EVENTS.STOP_TYPING, { peticionId });
  }

  // Observables para suscribirse a eventos
  onConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  onNuevaPeticion(): Observable<any> {
    return this.nuevaPeticion$.asObservable();
  }

  onCambioEstado(): Observable<any> {
    return this.cambioEstado$.asObservable();
  }

  onNuevoComentario(): Observable<any> {
    return this.nuevoComentario$.asObservable();
  }

  onPeticionAceptada(): Observable<any> {
    return this.peticionAceptada$.asObservable();
  }

  onPeticionVencida(): Observable<any> {
    return this.peticionVencida$.asObservable();
  }

  onUsuarioOnline(): Observable<any> {
    return this.usuarioOnline$.asObservable();
  }

  onUsuarioOffline(): Observable<any> {
    return this.usuarioOffline$.asObservable();
  }

  onUsuarioEscribiendo(): Observable<any> {
    return this.usuarioEscribiendo$.asObservable();
  }

  // Observables para notificaciones
  onNuevaNotificacion(): Observable<any> {
    return this.nuevaNotificacion$.asObservable();
  }

  onContadorNotificaciones(): Observable<number> {
    return this.contadorNotificaciones$.asObservable();
  }

  // Observable para usuarios conectados
  onUsuariosConectados(): Observable<number[]> {
    return this.usuariosConectados$.asObservable();
  }

  // Observable para cambios de estado de presencia
  onCambioEstadoPresencia(): Observable<any> {
    return this.cambioEstadoPresencia$.asObservable();
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
