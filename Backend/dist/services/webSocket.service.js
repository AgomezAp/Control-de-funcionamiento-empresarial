"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class WebSocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socketId
    }
    /**
     * Inicializar Socket.IO con el servidor HTTP
     */
    initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
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
    setupMiddleware() {
        if (!this.io)
            return;
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                console.error('❌ WebSocket: No token provided');
                return next(new Error('Authentication error: No token provided'));
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
                // Asignar propiedades al socket
                socket.userId = decoded.id;
                socket.userEmail = decoded.email;
                socket.userRole = decoded.rol;
                console.log(`🔐 Usuario autenticado: ${decoded.email} (ID: ${decoded.id})`);
                next();
            }
            catch (error) {
                console.error('❌ Error de autenticación WebSocket:', error);
                return next(new Error('Authentication error: Invalid token'));
            }
        });
    }
    /**
     * Configurar manejadores de conexión
     */
    setupConnectionHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            var _a;
            console.log(`✅ Cliente conectado: ${socket.id} - Usuario: ${socket.userId}`);
            // Registrar usuario conectado
            if (socket.userId) {
                this.connectedUsers.set(socket.userId, socket.id);
                // Notificar a todos que este usuario está online
                (_a = this.io) === null || _a === void 0 ? void 0 : _a.emit('usuarioOnline', {
                    userId: socket.userId,
                    email: socket.userEmail,
                    timestamp: new Date(),
                });
            }
            // JOIN ROOM - Unirse a una sala
            socket.on('joinRoom', (data) => {
                socket.join(data.room);
                console.log(`📥 Usuario ${socket.userId} se unió a la sala: ${data.room}`);
            });
            // LEAVE ROOM - Salir de una sala
            socket.on('leaveRoom', (data) => {
                socket.leave(data.room);
                console.log(`📤 Usuario ${socket.userId} salió de la sala: ${data.room}`);
            });
            // TYPING - Usuario está escribiendo
            socket.on('typing', (data) => {
                socket.to(`peticion_${data.peticionId}`).emit('usuarioEscribiendo', {
                    userId: socket.userId,
                    email: socket.userEmail,
                    peticionId: data.peticionId,
                });
            });
            // STOP TYPING - Usuario dejó de escribir
            socket.on('stopTyping', (data) => {
                socket.to(`peticion_${data.peticionId}`).emit('usuarioDejoDeEscribir', {
                    userId: socket.userId,
                    peticionId: data.peticionId,
                });
            });
            // DISCONNECT - Cliente desconectado
            socket.on('disconnect', () => {
                var _a;
                console.log(`❌ Cliente desconectado: ${socket.id} - Usuario: ${socket.userId}`);
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                    // Notificar a todos que este usuario está offline
                    (_a = this.io) === null || _a === void 0 ? void 0 : _a.emit('usuarioOffline', {
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
    emit(event, data) {
        if (this.io) {
            this.io.emit(event, data);
            console.log(`📡 Evento emitido: ${event}`, data);
        }
    }
    /**
     * Emitir evento a una sala específica
     */
    emitToRoom(room, event, data) {
        if (this.io) {
            this.io.to(room).emit(event, data);
            console.log(`📡 Evento emitido a sala ${room}: ${event}`);
        }
    }
    /**
     * Emitir evento a un usuario específico
     */
    emitToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit(event, data);
            console.log(`📡 Evento emitido a usuario ${userId}: ${event}`);
        }
    }
    /**
     * Emitir nueva petición a todos
     */
    emitNuevaPeticion(peticion) {
        this.emit('nuevaPeticion', {
            peticion,
            timestamp: new Date(),
        });
    }
    /**
     * Emitir cambio de estado de petición
     */
    emitCambioEstado(peticionId, nuevoEstado, fecha_resolucion) {
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
    emitPeticionAceptada(peticionId, usuarioId, usuario, fecha_aceptacion, fecha_limite, tiempo_limite_horas) {
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
    emitPeticionVencida(peticionId, peticion) {
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
    emitNuevoComentario(peticionId, comentario) {
        this.emitToRoom(`peticion_${peticionId}`, 'nuevoComentario', {
            peticionId,
            comentario,
            timestamp: new Date(),
        });
    }
    /**
     * Obtener usuarios conectados
     */
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
    /**
     * Verificar si un usuario está conectado
     */
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }
    /**
     * Obtener instancia de Socket.IO
     */
    getIO() {
        return this.io;
    }
}
// Exportar instancia singleton
exports.webSocketService = new WebSocketService();
exports.default = exports.webSocketService;
