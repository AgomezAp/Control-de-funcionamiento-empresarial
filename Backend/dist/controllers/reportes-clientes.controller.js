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
exports.obtenerMisReportes = exports.obtenerEstadisticas = exports.obtenerReportesPendientes = exports.actualizarEstado = exports.vincularPeticion = exports.asignarTecnico = exports.obtenerReportePorId = exports.obtenerReportes = exports.crearReporte = void 0;
const reporte_cliente_service_1 = __importDefault(require("../services/reporte-cliente.service"));
const ReporteCliente_1 = require("../models/ReporteCliente");
// Crear nuevo reporte
const crearReporte = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { cliente_id, tipo_problema, descripcion_problema, prioridad, notas_internas } = req.body;
        const creado_por = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
        if (!cliente_id || !tipo_problema || !descripcion_problema || !prioridad) {
            return res.status(400).json({
                ok: false,
                msg: "Faltan campos requeridos: cliente_id, tipo_problema, descripcion_problema, prioridad",
            });
        }
        if (!creado_por) {
            return res.status(401).json({
                ok: false,
                msg: "Usuario no autenticado",
            });
        }
        const reporte = yield reporte_cliente_service_1.default.crearReporte({
            cliente_id,
            tipo_problema: tipo_problema,
            descripcion_problema,
            prioridad: prioridad,
            creado_por,
            notas_internas,
        });
        res.status(201).json({
            ok: true,
            msg: "Reporte creado exitosamente",
            reporte,
        });
    }
    catch (error) {
        console.error("Error al crear reporte:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al crear reporte",
        });
    }
});
exports.crearReporte = crearReporte;
// Obtener reportes con filtros
const obtenerReportes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { estado, prioridad, tipo_problema, creado_por, atendido_por, cliente_id } = req.query;
        const filtros = {};
        if (estado)
            filtros.estado = estado;
        if (prioridad)
            filtros.prioridad = prioridad;
        if (tipo_problema)
            filtros.tipo_problema = tipo_problema;
        if (creado_por)
            filtros.creado_por = parseInt(creado_por);
        if (atendido_por)
            filtros.atendido_por = parseInt(atendido_por);
        if (cliente_id)
            filtros.cliente_id = parseInt(cliente_id);
        const reportes = yield reporte_cliente_service_1.default.obtenerReportes(filtros);
        res.json({
            ok: true,
            reportes,
            total: reportes.length,
        });
    }
    catch (error) {
        console.error("Error al obtener reportes:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al obtener reportes",
        });
    }
});
exports.obtenerReportes = obtenerReportes;
// Obtener reporte por ID
const obtenerReportePorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                ok: false,
                msg: "ID de reporte inválido",
            });
        }
        const reporte = yield reporte_cliente_service_1.default.obtenerReportePorId(parseInt(id));
        res.json({
            ok: true,
            reporte,
        });
    }
    catch (error) {
        console.error("Error al obtener reporte:", error);
        res.status(error.message.includes("no encontrado") ? 404 : 500).json({
            ok: false,
            msg: error.message || "Error al obtener reporte",
        });
    }
});
exports.obtenerReportePorId = obtenerReportePorId;
// Asignar técnico a reporte
const asignarTecnico = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const tecnico_id = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                ok: false,
                msg: "ID de reporte inválido",
            });
        }
        if (!tecnico_id) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo identificar al técnico",
            });
        }
        const reporte = yield reporte_cliente_service_1.default.asignarTecnico(parseInt(id), tecnico_id);
        res.json({
            ok: true,
            msg: "Técnico asignado exitosamente",
            reporte,
        });
    }
    catch (error) {
        console.error("Error al asignar técnico:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al asignar técnico",
        });
    }
});
exports.asignarTecnico = asignarTecnico;
// Vincular petición a reporte
const vincularPeticion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { peticion_id } = req.body;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                ok: false,
                msg: "ID de reporte inválido",
            });
        }
        if (!peticion_id) {
            return res.status(400).json({
                ok: false,
                msg: "ID de petición requerido",
            });
        }
        const reporte = yield reporte_cliente_service_1.default.vincularPeticion(parseInt(id), peticion_id);
        res.json({
            ok: true,
            msg: "Petición vinculada exitosamente",
            reporte,
        });
    }
    catch (error) {
        console.error("Error al vincular petición:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al vincular petición",
        });
    }
});
exports.vincularPeticion = vincularPeticion;
// Actualizar estado del reporte
const actualizarEstado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { estado, notas } = req.body;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                ok: false,
                msg: "ID de reporte inválido",
            });
        }
        if (!estado) {
            return res.status(400).json({
                ok: false,
                msg: "Estado requerido",
            });
        }
        // Validar que el estado sea válido
        if (!Object.values(ReporteCliente_1.EstadoReporte).includes(estado)) {
            return res.status(400).json({
                ok: false,
                msg: "Estado inválido. Valores permitidos: Pendiente, En Atención, Resuelto, Cancelado",
            });
        }
        const reporte = yield reporte_cliente_service_1.default.actualizarEstado(parseInt(id), estado, notas);
        res.json({
            ok: true,
            msg: "Estado actualizado exitosamente",
            reporte,
        });
    }
    catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al actualizar estado",
        });
    }
});
exports.actualizarEstado = actualizarEstado;
// Obtener reportes pendientes (para técnicos)
const obtenerReportesPendientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuario = req.usuario;
        if (!usuario || !usuario.area) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo identificar el área del usuario",
            });
        }
        const areaTipo = usuario.area;
        const reportes = yield reporte_cliente_service_1.default.obtenerReportesPendientes(areaTipo);
        res.json({
            ok: true,
            reportes,
            total: reportes.length,
        });
    }
    catch (error) {
        console.error("Error al obtener reportes pendientes:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al obtener reportes pendientes",
        });
    }
});
exports.obtenerReportesPendientes = obtenerReportesPendientes;
// Obtener estadísticas de reportes
const obtenerEstadisticas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuario = req.usuario;
        const { usuario_id } = req.query;
        // Si se especifica usuario_id y el usuario actual tiene permisos, usar ese ID
        // Si no, usar el ID del usuario actual
        const userId = usuario_id
            ? parseInt(usuario_id)
            : (usuario === null || usuario === void 0 ? void 0 : usuario.rol) === "Admin" || (usuario === null || usuario === void 0 ? void 0 : usuario.rol) === "Directivo"
                ? undefined
                : usuario === null || usuario === void 0 ? void 0 : usuario.uid;
        const estadisticas = yield reporte_cliente_service_1.default.obtenerEstadisticas(userId);
        res.json({
            ok: true,
            estadisticas,
        });
    }
    catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al obtener estadísticas",
        });
    }
});
exports.obtenerEstadisticas = obtenerEstadisticas;
// Obtener mis reportes (creados por el usuario actual)
const obtenerMisReportes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const creado_por = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.uid;
        if (!creado_por) {
            return res.status(400).json({
                ok: false,
                msg: "No se pudo identificar al usuario",
            });
        }
        const reportes = yield reporte_cliente_service_1.default.obtenerReportes({ creado_por });
        res.json({
            ok: true,
            reportes,
            total: reportes.length,
        });
    }
    catch (error) {
        console.error("Error al obtener mis reportes:", error);
        res.status(500).json({
            ok: false,
            msg: error.message || "Error al obtener mis reportes",
        });
    }
});
exports.obtenerMisReportes = obtenerMisReportes;
