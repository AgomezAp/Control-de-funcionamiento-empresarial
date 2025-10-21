import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthToken {
  uid: number;  // ✅ CORREGIDO: era "id"
  correo: string;  // ✅ CORREGIDO: era "email"
  rol: string;
  area: string;
}

interface SocketWithUser extends Socket {
  userId?: number;
  userEmail?: string;
  userRole?: string;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<number, string> = new Map(); // userId -> socketId

  /**
   * Inicializar Socket.IO con el servidor HTTP
   */
  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();

    console.log('✅ WebSocket Service initialized');
  }

  /**
   * Middleware para autenticación JWT
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket: SocketWithUser, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.error('❌ WebSocket: No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthToken;
        
        // ✅ CORREGIDO: Usar nombres correctos del JWT
        socket.userId = decoded.uid;  // era decoded.id
        socket.userEmail = decoded.correo;  // era decoded.email
        socket.userRole = decoded.rol;

        console.log(`🔐 Usuario autenticado: ${decoded.correo} (ID: ${decoded.uid})`);
        next();
      } catch (error) {
        console.error('❌ Error de autenticación WebSocket:', error);
        return next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  /**
   * Configurar manejadores de conexión
   */
  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: SocketWithUser) => {
      console.log(`✅ Cliente conectado: ${socket.id} - Usuario: ${socket.userId}`);

      // Registrar usuario conectado
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
        
        // Notificar a todos que este usuario está online
        this.io?.emit('usuarioOnline', {
          userId: socket.userId,
          email: socket.userEmail,
          timestamp: new Date(),
        });

        // Emitir lista actualizada de usuarios conectados a todos
        this.broadcastConnectedUsers();
      }

      // JOIN ROOM - Unirse a una sala
      socket.on('joinRoom', (data: { room: string }) => {
        socket.join(data.room);
        console.log(`📥 Usuario ${socket.userId} se unió a la sala: ${data.room}`);
      });

      // LEAVE ROOM - Salir de una sala
      socket.on('leaveRoom', (data: { room: string }) => {
        socket.leave(data.room);
        console.log(`📤 Usuario ${socket.userId} salió de la sala: ${data.room}`);
      });

      // TYPING - Usuario está escribiendo
      socket.on('typing', (data: { peticionId: number }) => {
        socket.to(`peticion_${data.peticionId}`).emit('usuarioEscribiendo', {
          userId: socket.userId,
          email: socket.userEmail,
          peticionId: data.peticionId,
        });
      });

      // STOP TYPING - Usuario dejó de escribir
      socket.on('stopTyping', (data: { peticionId: number }) => {
        socket.to(`peticion_${data.peticionId}`).emit('usuarioDejoDeEscribir', {
          userId: socket.userId,
          peticionId: data.peticionId,
        });
      });

      // DISCONNECT - Cliente desconectado
      socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id} - Usuario: ${socket.userId}`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          
          // Notificar a todos que este usuario está offline
          this.io?.emit('usuarioOffline', {
            userId: socket.userId,
            email: socket.userEmail,
            timestamp: new Date(),
          });

          // Emitir lista actualizada de usuarios conectados a todos
          this.broadcastConnectedUsers();
        }
      });
    });
  }

  /**
   * Emitir evento a todos los clientes conectados
   */
  public emit(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📡 Evento emitido: ${event}`, data);
    }
  }

  /**
   * Emitir evento a una sala específica
   */
  public emitToRoom(room: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(room).emit(event, data);
      console.log(`📡 Evento emitido a sala ${room}: ${event}`);
    }
  }

  /**
   * Emitir evento a un usuario específico
   */
  public emitToUser(userId: number, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
      console.log(`📡 Evento emitido a usuario ${userId}: ${event}`);
    }
  }

  /**
   * Emitir nueva petición a todos
   */
  public emitNuevaPeticion(peticion: any): void {
    this.emit('nuevaPeticion', {
      peticion,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir cambio de estado de petición
   */
  public emitCambioEstado(peticionId: number, nuevoEstado: string, fecha_resolucion?: Date): void {
    // ✅ CORREGIDO: Solo emitir a TODOS (no duplicar con room)
    // La mayoría de componentes escuchan globalmente, no por room
    this.emit('cambioEstado', {
      peticionId,
      nuevoEstado,
      fecha_resolucion,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir petición aceptada
   */
  public emitPeticionAceptada(
    peticionId: number,
    usuarioId: number,
    usuario: any,
    fecha_aceptacion: Date,
    fecha_limite: Date | null,
    tiempo_limite_horas: number
  ): void {
    const data = {
      peticionId,
      usuarioId,
      usuario,
      fecha_aceptacion,
      fecha_limite,
      tiempo_limite_horas,
      timestamp: new Date(),
    };

    // ✅ CORREGIDO: Solo emitir a TODOS (no duplicar con room)
    this.emit('peticionAceptada', data);
  }

  /**
   * Emitir petición vencida
   */
  public emitPeticionVencida(peticionId: number, peticion: any): void {
    const data = {
      peticionId,
      peticion,
      timestamp: new Date(),
    };

    // ✅ CORREGIDO: Solo emitir a TODOS (no duplicar con room)
    this.emit('peticionVencida', data);
  }

  /**
   * Emitir nuevo comentario
   */
  public emitNuevoComentario(peticionId: number, comentario: any): void {
    this.emitToRoom(`peticion_${peticionId}`, 'nuevoComentario', {
      peticionId,
      comentario,
      timestamp: new Date(),
    });
  }

  /**
   * Obtener usuarios conectados
   */
  public getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Verificar si un usuario está conectado
   */
  public isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Broadcast de lista de usuarios conectados a todos los clientes
   */
  private broadcastConnectedUsers(): void {
    const connectedUserIds = this.getConnectedUsers();
    this.emit('usuariosConectados', {
      usuarios: connectedUserIds,
      total: connectedUserIds.length,
      timestamp: new Date(),
    });
    console.log(`📡 Lista de usuarios conectados emitida: ${connectedUserIds.length} usuarios`);
  }

  /**
   * Obtener instancia de Socket.IO
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Exportar instancia singleton
export const webSocketService = new WebSocketService();
export default webSocketService;
