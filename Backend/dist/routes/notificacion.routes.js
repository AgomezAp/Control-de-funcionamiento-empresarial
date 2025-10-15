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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notificacion_service_1 = __importDefault(require("../services/notificacion.service"));
const router = (0, express_1.Router)();
/**
 * Obtener todas las notificaciones del usuario actual
 */
router.get("/", auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leida, limit } = req.query;
        const filtros = {};
        if (leida !== undefined) {
            filtros.leida = leida === "true";
        }
        if (limit) {
            filtros.limit = parseInt(limit);
        }
        const notificaciones = yield notificacion_service_1.default.obtenerPorUsuario(req.usuario.uid, filtros);
        res.json(notificaciones);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
/**
 * Obtener contador de notificaciones no leídas
 */
router.get("/no-leidas/count", auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const total = yield notificacion_service_1.default.contarNoLeidas(req.usuario.uid);
        res.json({ total });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
/**
 * Marcar notificación como leída
 */
router.patch("/:id/leida", auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notificacion = yield notificacion_service_1.default.marcarComoLeida(parseInt(req.params.id), req.usuario.uid);
        res.json(notificacion);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
}));
/**
 * Marcar todas las notificaciones como leídas
 */
router.patch("/todas/leidas", auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resultado = yield notificacion_service_1.default.marcarTodasComoLeidas(req.usuario.uid);
        res.json(resultado);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
/**
 * Eliminar notificación
 */
router.delete("/:id", auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resultado = yield notificacion_service_1.default.eliminar(parseInt(req.params.id), req.usuario.uid);
        res.json(resultado);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
}));
/**
 * Eliminar todas las notificaciones
 */
router.delete("/", auth_middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resultado = yield notificacion_service_1.default.eliminarTodas(req.usuario.uid);
        res.json(resultado);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
