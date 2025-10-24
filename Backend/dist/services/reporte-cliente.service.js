"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const ReporteCliente_1 = __importStar(require("../models/ReporteCliente"));
const Cliente_1 = __importDefault(require("../models/Cliente"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Peticion_1 = __importDefault(require("../models/Peticion"));
const sequelize_1 = require("sequelize");
const notificacion_service_1 = __importDefault(require("./notificacion.service"));
const webSocket_service_1 = __importDefault(require("./webSocket.service"));
class ReporteClienteService {
    /**
     * Crear nuevo reporte de cliente
     */
    crearReporte(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validar que el cliente existe
            const cliente = yield Cliente_1.default.findByPk(data.cliente_id);
            if (!cliente) {
                throw new Error("Cliente no encontrado");
            }
            // Validar que el usuario existe
            const usuario = yield Usuario_1.default.findByPk(data.creado_por);
            if (!usuario) {
                throw new Error("Usuario no encontrado");
            }
            // Crear el reporte
            const reporte = yield ReporteCliente_1.default.create(Object.assign(Object.assign({}, data), { estado: ReporteCliente_1.EstadoReporte.PENDIENTE, fecha_creacion: new Date(), peticiones_relacionadas: [] }));
            // Notificar a los técnicos del área correspondiente
            yield this.notificarNuevoReporte(reporte, cliente);
            // Emitir evento WebSocket
            webSocket_service_1.default.emit("nuevoReporteCliente", {
                reporte_id: reporte.id,
                cliente_nombre: cliente.nombre,
                tipo_problema: reporte.tipo_problema,
                prioridad: reporte.prioridad,
            });
            return reporte;
        });
    }
    /**
     * Obtener todos los reportes con filtros
     */
    obtenerReportes(filtros) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filtros) {
                if (filtros.estado)
                    where.estado = filtros.estado;
                if (filtros.prioridad)
                    where.prioridad = filtros.prioridad;
                if (filtros.tipo_problema)
                    where.tipo_problema = filtros.tipo_problema;
                if (filtros.creado_por)
                    where.creado_por = filtros.creado_por;
                if (filtros.atendido_por)
                    where.atendido_por = filtros.atendido_por;
                if (filtros.cliente_id)
                    where.cliente_id = filtros.cliente_id;
            }
            const reportes = yield ReporteCliente_1.default.findAll({
                where,
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "correo", "telefono"],
                    },
                    {
                        model: Usuario_1.default,
                        as: "creador",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                    {
                        model: Usuario_1.default,
                        as: "tecnico",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                ],
                order: [
                    ["prioridad", "DESC"], // Urgentes primero
                    ["fecha_creacion", "DESC"],
                ],
            });
            return reportes;
        });
    }
    /**
     * Obtener reporte por ID
     */
    obtenerReportePorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const reporte = yield ReporteCliente_1.default.findByPk(id, {
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                    },
                    {
                        model: Usuario_1.default,
                        as: "creador",
                        attributes: ["uid", "nombre_completo", "correo", "area_id"],
                        include: [
                            {
                                model: require("./Area").default,
                                as: "area",
                                attributes: ["id", "nombre"],
                            },
                        ],
                    },
                    {
                        model: Usuario_1.default,
                        as: "tecnico",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                ],
            });
            // Si tiene peticiones relacionadas, cargarlas
            if (reporte && reporte.peticiones_relacionadas && reporte.peticiones_relacionadas.length > 0) {
                const peticiones = yield Peticion_1.default.findAll({
                    where: {
                        id: { [sequelize_1.Op.in]: reporte.peticiones_relacionadas },
                    },
                    include: [
                        {
                            model: Usuario_1.default,
                            as: "asignado",
                            attributes: ["uid", "nombre_completo"],
                        },
                    ],
                });
                // @ts-ignore - Agregar peticiones al reporte temporalmente
                reporte.peticiones = peticiones;
            }
            return reporte;
        });
    }
    /**
     * Asignar técnico a un reporte (Pautador/Diseñador toma el reporte)
     */
    asignarTecnico(reporteId, tecnicoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reporte = yield ReporteCliente_1.default.findByPk(reporteId);
            if (!reporte) {
                throw new Error("Reporte no encontrado");
            }
            const tecnico = yield Usuario_1.default.findByPk(tecnicoId);
            if (!tecnico) {
                throw new Error("Técnico no encontrado");
            }
            reporte.atendido_por = tecnicoId;
            reporte.estado = ReporteCliente_1.EstadoReporte.EN_ATENCION;
            reporte.fecha_atencion = new Date();
            yield reporte.save();
            // Notificar al creador del reporte
            yield notificacion_service_1.default.crear({
                usuario_id: reporte.creado_por,
                tipo: "sistema",
                titulo: "Reporte en atención",
                mensaje: `${tecnico.nombre_completo} está atendiendo el reporte #${reporteId}`,
            });
            return reporte;
        });
    }
    /**
     * Vincular petición a un reporte
     */
    vincularPeticion(reporteId, peticionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reporte = yield ReporteCliente_1.default.findByPk(reporteId);
            if (!reporte) {
                throw new Error("Reporte no encontrado");
            }
            const peticion = yield Peticion_1.default.findByPk(peticionId);
            if (!peticion) {
                throw new Error("Petición no encontrada");
            }
            // Agregar petición al array
            const peticionesActuales = reporte.peticiones_relacionadas || [];
            if (!peticionesActuales.includes(peticionId)) {
                peticionesActuales.push(peticionId);
                reporte.peticiones_relacionadas = peticionesActuales;
                yield reporte.save();
            }
            return reporte;
        });
    }
    /**
     * Actualizar estado del reporte
     */
    actualizarEstado(reporteId, nuevoEstado, notas) {
        return __awaiter(this, void 0, void 0, function* () {
            const reporte = yield ReporteCliente_1.default.findByPk(reporteId);
            if (!reporte) {
                throw new Error("Reporte no encontrado");
            }
            reporte.estado = nuevoEstado;
            if (nuevoEstado === ReporteCliente_1.EstadoReporte.RESUELTO) {
                reporte.fecha_resolucion = new Date();
            }
            if (notas) {
                reporte.notas_internas = notas;
            }
            yield reporte.save();
            // Notificar al creador
            yield notificacion_service_1.default.crear({
                usuario_id: reporte.creado_por,
                tipo: "sistema",
                titulo: `Reporte ${nuevoEstado.toLowerCase()}`,
                mensaje: `El reporte #${reporteId} ha sido ${nuevoEstado.toLowerCase()}`,
            });
            return reporte;
        });
    }
    /**
     * Obtener reportes pendientes para técnicos (Pautadores/Diseñadores)
     */
    obtenerReportesPendientes(areaTipo) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                estado: ReporteCliente_1.EstadoReporte.PENDIENTE,
            };
            // Filtrar por tipo de problema según el área
            if (areaTipo === "Pautas") {
                where.tipo_problema = {
                    [sequelize_1.Op.in]: [ReporteCliente_1.TipoProblema.CAMPANA, ReporteCliente_1.TipoProblema.SOPORTE_TECNICO],
                };
            }
            else if (areaTipo === "Diseño") {
                where.tipo_problema = {
                    [sequelize_1.Op.in]: [ReporteCliente_1.TipoProblema.DISENO_WEB, ReporteCliente_1.TipoProblema.SOPORTE_TECNICO],
                };
            }
            const reportes = yield ReporteCliente_1.default.findAll({
                where,
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "correo", "telefono"],
                    },
                    {
                        model: Usuario_1.default,
                        as: "creador",
                        attributes: ["uid", "nombre_completo"],
                    },
                ],
                order: [
                    ["prioridad", "DESC"],
                    ["fecha_creacion", "ASC"],
                ],
            });
            return reportes;
        });
    }
    /**
     * Obtener estadísticas de reportes
     */
    obtenerEstadisticas(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (userId) {
                where.creado_por = userId;
            }
            const total = yield ReporteCliente_1.default.count({ where });
            const pendientes = yield ReporteCliente_1.default.count({
                where: Object.assign(Object.assign({}, where), { estado: ReporteCliente_1.EstadoReporte.PENDIENTE }),
            });
            const enAtencion = yield ReporteCliente_1.default.count({
                where: Object.assign(Object.assign({}, where), { estado: ReporteCliente_1.EstadoReporte.EN_ATENCION }),
            });
            const resueltos = yield ReporteCliente_1.default.count({
                where: Object.assign(Object.assign({}, where), { estado: ReporteCliente_1.EstadoReporte.RESUELTO }),
            });
            // Estadísticas por prioridad
            const porPrioridad = yield Promise.all(Object.values(ReporteCliente_1.PrioridadReporte).map((prioridad) => __awaiter(this, void 0, void 0, function* () {
                return ({
                    prioridad,
                    count: yield ReporteCliente_1.default.count({ where: Object.assign(Object.assign({}, where), { prioridad }) }),
                });
            })));
            // Tiempo promedio de resolución (últimos 30 días)
            const hace30Dias = new Date();
            hace30Dias.setDate(hace30Dias.getDate() - 30);
            const reportesResueltos = yield ReporteCliente_1.default.findAll({
                where: Object.assign(Object.assign({}, where), { estado: ReporteCliente_1.EstadoReporte.RESUELTO, fecha_resolucion: { [sequelize_1.Op.gte]: hace30Dias } }),
                attributes: ["fecha_creacion", "fecha_resolucion"],
            });
            let tiempoPromedioHoras = 0;
            if (reportesResueltos.length > 0) {
                const tiempos = reportesResueltos.map((r) => {
                    const diff = r.fecha_resolucion.getTime() - r.fecha_creacion.getTime();
                    return diff / (1000 * 60 * 60); // Convertir a horas
                });
                tiempoPromedioHoras =
                    tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
            }
            return {
                total,
                pendientes,
                enAtencion,
                resueltos,
                porPrioridad,
                tiempoPromedioResolucion: Math.round(tiempoPromedioHoras * 10) / 10,
            };
        });
    }
    /**
     * Notificar nuevo reporte a los técnicos
     */
    notificarNuevoReporte(reporte, cliente) {
        return __awaiter(this, void 0, void 0, function* () {
            // Determinar a quién notificar según el tipo de problema
            let usuariosANotificar = [];
            if (reporte.tipo_problema === ReporteCliente_1.TipoProblema.CAMPANA ||
                reporte.tipo_problema === ReporteCliente_1.TipoProblema.SOPORTE_TECNICO) {
                // Notificar al pautador del cliente
                if (cliente.pautador_id) {
                    const pautador = yield Usuario_1.default.findByPk(cliente.pautador_id);
                    if (pautador)
                        usuariosANotificar.push(pautador);
                }
            }
            if (reporte.tipo_problema === ReporteCliente_1.TipoProblema.DISENO_WEB ||
                reporte.tipo_problema === ReporteCliente_1.TipoProblema.SOPORTE_TECNICO) {
                // Notificar al diseñador del cliente
                if (cliente.disenador_id) {
                    const disenador = yield Usuario_1.default.findByPk(cliente.disenador_id);
                    if (disenador)
                        usuariosANotificar.push(disenador);
                }
            }
            // Crear notificaciones
            for (const usuario of usuariosANotificar) {
                yield notificacion_service_1.default.crear({
                    usuario_id: usuario.uid,
                    tipo: "sistema",
                    titulo: "Nuevo reporte de cliente",
                    mensaje: `${cliente.nombre}: ${reporte.tipo_problema} - ${reporte.prioridad}`,
                });
            }
        });
    }
}
exports.default = new ReporteClienteService();
