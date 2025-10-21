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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const usuario_service_1 = require("../services/usuario.service");
const response_util_1 = require("../utils/response.util");
const webSocket_service_1 = require("../services/webSocket.service");
const usuarioService = new usuario_service_1.UsuarioService();
class UsuarioController {
    obtenerTodos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarios = yield usuarioService.obtenerTodos(req.usuario);
                return response_util_1.ApiResponse.success(res, usuarios, "Usuarios obtenidos exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener usuarios", error.statusCode || 500);
            }
        });
    }
    obtenerPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.params;
                const usuario = yield usuarioService.obtenerPorId(Number(uid), req.usuario);
                return response_util_1.ApiResponse.success(res, usuario, "Usuario obtenido exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener usuario", error.statusCode || 500);
            }
        });
    }
    actualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.params;
                const usuario = yield usuarioService.actualizar(Number(uid), req.body, req.usuario);
                return response_util_1.ApiResponse.success(res, usuario, "Usuario actualizado exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al actualizar usuario", error.statusCode || 500);
            }
        });
    }
    cambiarStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.params;
                const { status } = req.body;
                const usuario = yield usuarioService.cambiarStatus(Number(uid), status, req.usuario);
                return response_util_1.ApiResponse.success(res, usuario, `Usuario ${status ? "activado" : "desactivado"} exitosamente`);
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al cambiar status", error.statusCode || 500);
            }
        });
    }
    obtenerPorArea(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { area } = req.params;
                const usuarios = yield usuarioService.obtenerPorArea(area);
                return response_util_1.ApiResponse.success(res, usuarios, `Usuarios del área ${area} obtenidos exitosamente`);
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener usuarios por área", error.statusCode || 500);
            }
        });
    }
    /**
     * Obtener IDs de usuarios conectados actualmente
     */
    obtenerConectados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuariosConectadosIds = webSocket_service_1.webSocketService.getConnectedUsers();
                return response_util_1.ApiResponse.success(res, {
                    usuarios: usuariosConectadosIds,
                    total: usuariosConectadosIds.length,
                    timestamp: new Date(),
                }, "Usuarios conectados obtenidos exitosamente");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al obtener usuarios conectados", error.statusCode || 500);
            }
        });
    }
    /**
     * Cambiar estado de presencia del usuario actual
     */
    cambiarEstadoPresencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.usuario) {
                    return response_util_1.ApiResponse.error(res, "Usuario no autenticado", 401);
                }
                const { estadoPresencia } = req.body;
                if (!estadoPresencia) {
                    return response_util_1.ApiResponse.error(res, "El estado de presencia es requerido", 400);
                }
                const usuario = yield usuarioService.cambiarEstadoPresencia(req.usuario.uid, estadoPresencia, req.usuario);
                // Emitir evento de cambio de estado vía WebSocket
                webSocket_service_1.webSocketService.emit("cambioEstadoPresencia", {
                    userId: req.usuario.uid,
                    estadoPresencia,
                    timestamp: new Date(),
                });
                return response_util_1.ApiResponse.success(res, usuario, `Estado de presencia cambiado a ${estadoPresencia}`);
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al cambiar estado de presencia", error.statusCode || 500);
            }
        });
    }
    /**
     * Actualizar última actividad del usuario actual
     */
    actualizarActividad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.usuario) {
                    return response_util_1.ApiResponse.error(res, "Usuario no autenticado", 401);
                }
                yield usuarioService.actualizarActividad(req.usuario.uid);
                return response_util_1.ApiResponse.success(res, null, "Actividad actualizada");
            }
            catch (error) {
                return response_util_1.ApiResponse.error(res, error.message || "Error al actualizar actividad", error.statusCode || 500);
            }
        });
    }
}
exports.UsuarioController = UsuarioController;
