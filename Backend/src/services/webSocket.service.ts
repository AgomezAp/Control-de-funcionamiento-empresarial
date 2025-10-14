import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthToken {
  id: number;
  email: string;
  rol: string;
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
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthToken;
        
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.rol;

        console.log(`🔐 Usuario autenticado: ${decoded.email} (ID: ${decoded.id})`);
        next();
      } catch (error) {
        console.error('❌ Error de autenticación WebSocket:', error);
        next(new Error('Authentication error: Invalid token'));
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
    this.emit('cambioEstado', {
      peticionId,
      nuevoEstado,
      fecha_resolucion,
      timestamp: new Date(),
    });

    // También emitir a la sala específica de la petición
    this.emitToRoom(`peticion_${peticionId}`, 'cambioEstado', {
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

    this.emit('peticionAceptada', data);
    this.emitToRoom(`peticion_${peticionId}`, 'peticionAceptada', data);
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

    this.emit('peticionVencida', data);
    this.emitToRoom(`peticion_${peticionId}`, 'peticionVencida', data);
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
   * Obtener instancia de Socket.IO
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Exportar instancia singleton
export const webSocketService = new WebSocketService();
export default webSocketService;
