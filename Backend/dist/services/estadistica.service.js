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
exports.EstadisticaService = void 0;
const EstadisticasUsuario_1 = __importDefault(require("../models/EstadisticasUsuario"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Peticion_1 = __importDefault(require("../models/Peticion"));
const PeticionHistorico_1 = __importDefault(require("../models/PeticionHistorico"));
const Area_1 = __importDefault(require("../models/Area"));
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class EstadisticaService {
    calcularEstadisticasUsuario(usuario_id, año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechaInicio = new Date(año, mes - 1, 1);
            const fechaFin = new Date(año, mes, 0, 23, 59, 59);
            // Peticiones creadas (activas + históricas)
            const peticiones_creadas_activas = yield Peticion_1.default.count({
                where: {
                    creador_id: usuario_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
            });
            const peticiones_creadas_historico = yield PeticionHistorico_1.default.count({
                where: {
                    creador_id: usuario_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
            });
            const peticiones_creadas = peticiones_creadas_activas + peticiones_creadas_historico;
            // Peticiones resueltas (solo históricas porque las resueltas se mueven ahí)
            const peticiones_resueltas = yield PeticionHistorico_1.default.count({
                where: {
                    asignado_a: usuario_id,
                    estado: "Resuelta",
                    fecha_resolucion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
            });
            // Peticiones canceladas (solo históricas porque las canceladas se mueven ahí)
            const peticiones_canceladas = yield PeticionHistorico_1.default.count({
                where: {
                    asignado_a: usuario_id,
                    estado: "Cancelada",
                    fecha_resolucion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
            });
            // Tiempo promedio de resolución
            const peticionesConTiempo = yield PeticionHistorico_1.default.findAll({
                where: {
                    asignado_a: usuario_id,
                    estado: "Resuelta",
                    fecha_resolucion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                    fecha_aceptacion: {
                        [sequelize_1.Op.not]: null,
                    },
                },
                attributes: ["fecha_aceptacion", "fecha_resolucion"],
            });
            let tiempo_promedio_resolucion_horas = null;
            if (peticionesConTiempo.length > 0) {
                const tiemposTotales = peticionesConTiempo.map((p) => {
                    const inicio = new Date(p.fecha_aceptacion).getTime();
                    const fin = new Date(p.fecha_resolucion).getTime();
                    return (fin - inicio) / (1000 * 60 * 60); // Convertir a horas
                });
                tiempo_promedio_resolucion_horas =
                    tiemposTotales.reduce((sum, t) => sum + t, 0) / tiemposTotales.length;
            }
            // Costo total generado (suma de peticiones resueltas)
            // ⬇️ AQUÍ ESTÁ LA CORRECCIÓN
            const resultadoCosto = (yield PeticionHistorico_1.default.findOne({
                where: {
                    asignado_a: usuario_id,
                    estado: "Resuelta",
                    fecha_resolucion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
                attributes: [[connection_1.default.fn("SUM", connection_1.default.col("costo")), "total"]],
                raw: true,
            }));
            const costo_total_generado = Number((resultadoCosto === null || resultadoCosto === void 0 ? void 0 : resultadoCosto.total) || 0);
            // Crear o actualizar estadística
            const [estadistica, created] = yield EstadisticasUsuario_1.default.findOrCreate({
                where: {
                    usuario_id,
                    año,
                    mes,
                },
                defaults: {
                    usuario_id,
                    año,
                    mes,
                    peticiones_creadas,
                    peticiones_resueltas,
                    peticiones_canceladas,
                    tiempo_promedio_resolucion_horas,
                    costo_total_generado,
                    fecha_calculo: new Date(),
                },
            });
            if (!created) {
                yield estadistica.update({
                    peticiones_creadas,
                    peticiones_resueltas,
                    peticiones_canceladas,
                    tiempo_promedio_resolucion_horas,
                    costo_total_generado,
                    fecha_calculo: new Date(),
                });
            }
            return estadistica;
        });
    }
    obtenerEstadisticasUsuario(usuario_id, año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { usuario_id };
            if (año) {
                whereClause.año = año;
            }
            if (mes) {
                whereClause.mes = mes;
            }
            return yield EstadisticasUsuario_1.default.findAll({
                where: whereClause,
                include: [
                    {
                        model: Usuario_1.default,
                        as: "usuario",
                        attributes: ["uid", "nombre_completo", "correo"],
                        include: [{ model: Area_1.default, as: "area", attributes: ["nombre"] }],
                    },
                ],
                order: [
                    ["año", "DESC"],
                    ["mes", "DESC"],
                ],
            });
        });
    }
    obtenerEstadisticasPorArea(area_nombre, año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const area = yield Area_1.default.findOne({ where: { nombre: area_nombre } });
            if (!area) {
                return [];
            }
            const usuariosArea = yield Usuario_1.default.findAll({
                where: { area_id: area.id },
                attributes: ["uid"],
            });
            const usuariosIds = usuariosArea.map((u) => u.uid);
            return yield EstadisticasUsuario_1.default.findAll({
                where: {
                    usuario_id: usuariosIds,
                    año,
                    mes,
                },
                include: [
                    {
                        model: Usuario_1.default,
                        as: "usuario",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                ],
                order: [["peticiones_resueltas", "DESC"]],
            });
        });
    }
    obtenerEstadisticasGlobales(año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const estadisticas = yield EstadisticasUsuario_1.default.findAll({
                where: { año, mes },
                include: [
                    {
                        model: Usuario_1.default,
                        as: "usuario",
                        attributes: ["uid", "nombre_completo"],
                        include: [{ model: Area_1.default, as: "area", attributes: ["nombre"] }],
                    },
                ],
            });
            const totales = {
                total_peticiones_creadas: 0,
                total_peticiones_resueltas: 0,
                total_peticiones_canceladas: 0,
                total_costo_generado: 0,
                promedio_tiempo_resolucion: 0,
            };
            let sumaPromediosTiempo = 0;
            let contadorPromedios = 0;
            estadisticas.forEach((est) => {
                totales.total_peticiones_creadas += est.peticiones_creadas;
                totales.total_peticiones_resueltas += est.peticiones_resueltas;
                totales.total_peticiones_canceladas += est.peticiones_canceladas;
                totales.total_costo_generado += Number(est.costo_total_generado);
                if (est.tiempo_promedio_resolucion_horas) {
                    sumaPromediosTiempo += Number(est.tiempo_promedio_resolucion_horas);
                    contadorPromedios++;
                }
            });
            if (contadorPromedios > 0) {
                totales.promedio_tiempo_resolucion =
                    sumaPromediosTiempo / contadorPromedios;
            }
            // Agrupar por área
            const porArea = {};
            estadisticas.forEach((est) => {
                const areaNombre = est.usuario.area.nombre;
                if (!porArea[areaNombre]) {
                    porArea[areaNombre] = {
                        area: areaNombre,
                        peticiones_creadas: 0,
                        peticiones_resueltas: 0,
                        costo_total: 0,
                    };
                }
                porArea[areaNombre].peticiones_creadas += est.peticiones_creadas;
                porArea[areaNombre].peticiones_resueltas += est.peticiones_resueltas;
                porArea[areaNombre].costo_total += Number(est.costo_total_generado);
            });
            return {
                totales,
                por_area: Object.values(porArea),
                por_usuario: estadisticas,
            };
        });
    }
    recalcularTodasEstadisticas(año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarios = yield Usuario_1.default.findAll({
                where: { status: true },
                attributes: ["uid"],
            });
            const resultados = [];
            for (const usuario of usuarios) {
                const estadistica = yield this.calcularEstadisticasUsuario(usuario.uid, año, mes);
                resultados.push(estadistica);
            }
            console.log(`✅ Recalculadas ${resultados.length} estadísticas para ${año}-${mes}`);
            return resultados;
        });
    }
}
exports.EstadisticaService = EstadisticaService;
