"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notificacion_1 = __importDefault(require("../models/Notificacion"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Peticion_1 = __importDefault(require("../models/Peticion"));
const webSocket_service_1 = __importDefault(require("./webSocket.service"));
const sequelize_1 = require("sequelize");
class NotificacionService {
    /**
     * Crear una notificación y enviarla en tiempo real
     */
    crear(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Crear la notificación en la base de datos
                const notificacion = yield Notificacion_1.default.create({
                    usuario_id: data.usuario_id,
                    tipo: data.tipo,
                    titulo: data.titulo,
                    mensaje: data.mensaje,
                    peticion_id: data.peticion_id,
                    leida: false,
                    fecha_creacion: new Date(),
                });
                // Obtener la notificación con las relaciones
                const notificacionCompleta = yield this.obtenerPorId(notificacion.id);
                // Emitir la notificación en tiempo real al usuario específico
                webSocket_service_1.default.emitToUser(data.usuario_id, "nuevaNotificacion", notificacionCompleta);
                // También emitir el contador de notificaciones no leídas
                const noLeidas = yield this.contarNoLeidas(data.usuario_id);
                webSocket_service_1.default.emitToUser(data.usuario_id, "contadorNotificaciones", {
                    total: noLeidas,
                });
                console.log(`📬 Notificación creada y enviada a usuario ${data.usuario_id}`);
                return notificacionCompleta;
            }
            catch (error) {
                console.error("Error al crear notificación:", error);
                throw error;
            }
        });
    }
    /**
     * Crear notificación de asignación de petición
     */
    notificarAsignacion(peticion, usuarioAsignado, usuarioAsignador) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return yield this.crear({
                usuario_id: usuarioAsignado.uid,
                tipo: "asignacion",
                titulo: "Nueva petición asignada",
                mensaje: `${usuarioAsignador.nombre_completo} te ha asignado una petición de ${((_a = peticion.cliente) === null || _a === void 0 ? void 0 : _a.nombre) || "un cliente"}`,
                peticion_id: peticion.id,
            });
        });
    }
    /**
     * Obtener notificación por ID
     */
    obtenerPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Notificacion_1.default.findByPk(id, {
                include: [
                    {
                        model: Usuario_1.default,
                        as: "usuario",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                    {
                        model: Peticion_1.default,
                        as: "peticion",
                        attributes: ["id", "descripcion", "estado"],
                    },
                ],
            });
        });
    }
    /**
     * Obtener todas las notificaciones de un usuario
     */
    obtenerPorUsuario(usuario_id, filtros) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { usuario_id };
            if ((filtros === null || filtros === void 0 ? void 0 : filtros.leida) !== undefined) {
                whereClause.leida = filtros.leida;
            }
            const notificaciones = yield Notificacion_1.default.findAll({
                where: whereClause,
                include: [
                    {
                        model: Peticion_1.default,
                        as: "peticion",
                        attributes: ["id", "descripcion", "estado"],
                        required: false,
                    },
                ],
                order: [["fecha_creacion", "DESC"]],
                limit: (filtros === null || filtros === void 0 ? void 0 : filtros.limit) || 50,
            });
            return notificaciones;
        });
    }
    /**
     * Marcar notificación como leída
     */
    marcarComoLeida(id, usuario_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificacion = yield Notificacion_1.default.findOne({
                where: { id, usuario_id },
            });
            if (!notificacion) {
                throw new Error("Notificación no encontrada");
            }
            if (notificacion.leida) {
                return notificacion;
            }
            yield notificacion.update({
                leida: true,
                fecha_lectura: new Date(),
            });
            // Actualizar contador de notificaciones no leídas
            const noLeidas = yield this.contarNoLeidas(usuario_id);
            webSocket_service_1.default.emitToUser(usuario_id, "contadorNotificaciones", {
                total: noLeidas,
            });
            return notificacion;
        });
    }
    /**
     * Marcar todas las notificaciones como leídas
     */
    marcarTodasComoLeidas(usuario_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Notificacion_1.default.update({
                leida: true,
                fecha_lectura: new Date(),
            }, {
                where: {
                    usuario_id,
                    leida: false,
                },
            });
            // Actualizar contador
            webSocket_service_1.default.emitToUser(usuario_id, "contadorNotificaciones", {
                total: 0,
            });
            return { message: "Todas las notificaciones marcadas como leídas" };
        });
    }
    /**
     * Contar notificaciones no leídas
     */
    contarNoLeidas(usuario_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Notificacion_1.default.count({
                where: {
                    usuario_id,
                    leida: false,
                },
            });
        });
    }
    /**
     * Eliminar notificación
     */
    eliminar(id, usuario_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificacion = yield Notificacion_1.default.findOne({
                where: { id, usuario_id },
            });
            if (!notificacion) {
                throw new Error("Notificación no encontrada");
            }
            yield notificacion.destroy();
            // Actualizar contador
            const noLeidas = yield this.contarNoLeidas(usuario_id);
            webSocket_service_1.default.emitToUser(usuario_id, "contadorNotificaciones", {
                total: noLeidas,
            });
            return { message: "Notificación eliminada" };
        });
    }
    /**
     * Eliminar todas las notificaciones de un usuario
     */
    eliminarTodas(usuario_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Notificacion_1.default.destroy({
                where: { usuario_id },
            });
            webSocket_service_1.default.emitToUser(usuario_id, "contadorNotificaciones", {
                total: 0,
            });
            return { message: "Todas las notificaciones eliminadas" };
        });
    }
    /**
     * Limpiar notificaciones antiguas (más de 30 días)
     */
    limpiarAntiguas() {
        return __awaiter(this, void 0, void 0, function* () {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 30);
            const eliminadas = yield Notificacion_1.default.destroy({
                where: {
                    fecha_creacion: {
                        [sequelize_1.Op.lt]: fechaLimite,
                    },
                    leida: true,
                },
            });
            console.log(`🧹 Limpieza: ${eliminadas} notificaciones antiguas eliminadas`);
            return eliminadas;
        });
    }
}
exports.default = new NotificacionService();
