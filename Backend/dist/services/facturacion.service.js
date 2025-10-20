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
exports.FacturacionService = void 0;
const PeriodoFacturacion_1 = __importDefault(require("../models/PeriodoFacturacion"));
const Cliente_1 = __importDefault(require("../models/Cliente"));
const Peticion_1 = __importDefault(require("../models/Peticion"));
const PeticionHistorico_1 = __importDefault(require("../models/PeticionHistorico"));
const Categoria_1 = __importDefault(require("../models/Categoria"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const sequelize_1 = require("sequelize");
const error_util_1 = require("../utils/error.util");
class FacturacionService {
    generarPeriodoFacturacion(cliente_id, año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el cliente existe
            const cliente = yield Cliente_1.default.findByPk(cliente_id);
            if (!cliente) {
                throw new error_util_1.NotFoundError("Cliente no encontrado");
            }
            // Calcular fechas del periodo
            const fechaInicio = new Date(año, mes - 1, 1);
            const fechaFin = new Date(año, mes, 0, 23, 59, 59);
            // Buscar peticiones del periodo (activas)
            const peticionesActivas = yield Peticion_1.default.findAll({
                where: {
                    cliente_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
            });
            // Buscar peticiones del periodo (histórico)
            const peticionesHistorico = yield PeticionHistorico_1.default.findAll({
                where: {
                    cliente_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
            });
            const todasPeticiones = [...peticionesActivas, ...peticionesHistorico];
            // Calcular totales
            const total_peticiones = todasPeticiones.length;
            const costo_total = todasPeticiones.reduce((sum, p) => sum + Number(p.costo), 0);
            // Crear o actualizar periodo de facturación
            const [periodo, created] = yield PeriodoFacturacion_1.default.findOrCreate({
                where: {
                    cliente_id,
                    año,
                    mes,
                },
                defaults: {
                    cliente_id,
                    año,
                    mes,
                    total_peticiones,
                    costo_total,
                    estado: "Abierto",
                },
            });
            if (!created) {
                yield periodo.update({
                    total_peticiones,
                    costo_total,
                });
            }
            return yield this.obtenerPeriodoPorId(periodo.id);
        });
    }
    obtenerPeriodoPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const periodo = yield PeriodoFacturacion_1.default.findByPk(id, {
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "cedula", "tipo_persona", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
                    },
                ],
            });
            if (!periodo) {
                throw new error_util_1.NotFoundError("Periodo de facturación no encontrado");
            }
            return periodo;
        });
    }
    obtenerPeriodosPorCliente(cliente_id, año) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { cliente_id };
            if (año) {
                whereClause.año = año;
            }
            return yield PeriodoFacturacion_1.default.findAll({
                where: whereClause,
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre"],
                    },
                ],
                order: [["año", "DESC"], ["mes", "DESC"]],
            });
        });
    }
    obtenerDetallePeriodo(cliente_id, año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            // Buscar el periodo
            const periodo = yield PeriodoFacturacion_1.default.findOne({
                where: { cliente_id, año, mes },
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "cedula", "tipo_persona", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
                    },
                ],
            });
            if (!periodo) {
                throw new error_util_1.NotFoundError("Periodo de facturación no encontrado");
            }
            // Obtener peticiones del periodo
            const fechaInicio = new Date(año, mes - 1, 1);
            const fechaFin = new Date(año, mes, 0, 23, 59, 59);
            const peticionesActivas = yield Peticion_1.default.findAll({
                where: {
                    cliente_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
                include: [
                    { model: Categoria_1.default, as: "categoria", attributes: ["nombre", "area_tipo"] },
                    {
                        model: Usuario_1.default,
                        as: "asignado",
                        attributes: ["uid", "nombre_completo", "correo"]
                    },
                ],
            });
            const peticionesHistorico = yield PeticionHistorico_1.default.findAll({
                where: {
                    cliente_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
                include: [
                    { model: Categoria_1.default, as: "categoria", attributes: ["nombre", "area_tipo"] },
                    {
                        model: Usuario_1.default,
                        as: "asignado",
                        attributes: ["uid", "nombre_completo", "correo"]
                    },
                ],
            });
            const todasPeticiones = [...peticionesActivas, ...peticionesHistorico];
            // Agrupar por categoría
            const porCategoria = {};
            todasPeticiones.forEach((pet) => {
                const categoriaNombre = pet.categoria.nombre;
                if (!porCategoria[categoriaNombre]) {
                    porCategoria[categoriaNombre] = {
                        categoria: categoriaNombre,
                        area_tipo: pet.categoria.area_tipo,
                        cantidad: 0,
                        costo_total: 0,
                    };
                }
                porCategoria[categoriaNombre].cantidad++;
                porCategoria[categoriaNombre].costo_total += Number(pet.costo);
            });
            return {
                periodo,
                detalle_peticiones: todasPeticiones,
                resumen_categorias: Object.values(porCategoria),
                totales: {
                    total_peticiones: todasPeticiones.length,
                    costo_total: todasPeticiones.reduce((sum, p) => sum + Number(p.costo), 0),
                },
            };
        });
    }
    cerrarPeriodo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const periodo = yield PeriodoFacturacion_1.default.findByPk(id);
            if (!periodo) {
                throw new error_util_1.NotFoundError("Periodo de facturación no encontrado");
            }
            yield periodo.update({ estado: "Cerrado" });
            return periodo;
        });
    }
    facturarPeriodo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const periodo = yield PeriodoFacturacion_1.default.findByPk(id);
            if (!periodo) {
                throw new error_util_1.NotFoundError("Periodo de facturación no encontrado");
            }
            if (periodo.estado !== "Cerrado") {
                yield periodo.update({ estado: "Cerrado" });
            }
            yield periodo.update({ estado: "Facturado" });
            return periodo;
        });
    }
    obtenerResumenFacturacionMensual(año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const periodos = yield PeriodoFacturacion_1.default.findAll({
                where: { año, mes },
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "cedula", "tipo_persona", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
                    },
                ],
                order: [["costo_total", "DESC"]],
            });
            const totales = {
                total_clientes: periodos.length,
                total_peticiones: periodos.reduce((sum, p) => sum + p.total_peticiones, 0),
                costo_total: periodos.reduce((sum, p) => sum + Number(p.costo_total), 0),
                por_estado: {
                    abiertos: periodos.filter((p) => p.estado === "Abierto").length,
                    cerrados: periodos.filter((p) => p.estado === "Cerrado").length,
                    facturados: periodos.filter((p) => p.estado === "Facturado").length,
                },
            };
            return {
                periodos,
                totales,
            };
        });
    }
    generarPeriodosParaTodosLosClientes(año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientes = yield Cliente_1.default.findAll({
                where: { status: true },
                attributes: ["id"],
            });
            const resultados = [];
            for (const cliente of clientes) {
                try {
                    const periodo = yield this.generarPeriodoFacturacion(cliente.id, año, mes);
                    resultados.push(periodo);
                }
                catch (error) {
                    console.error(`Error generando periodo para cliente ${cliente.id}:`, error);
                }
            }
            console.log(`✅ Generados ${resultados.length} periodos de facturación para ${año}-${mes}`);
            return resultados;
        });
    }
    /**
     * Genera facturación automática para TODAS las peticiones resueltas del periodo
     * que no tengan un periodo de facturación asociado
     */
    generarFacturacionAutomatica(año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechaInicio = new Date(año, mes - 1, 1);
            const fechaFin = new Date(año, mes, 0, 23, 59, 59);
            // 1. Buscar TODAS las peticiones resueltas del periodo en el histórico
            const peticionesResueltas = yield PeticionHistorico_1.default.findAll({
                where: {
                    estado: "Resuelta",
                    fecha_resolucion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "cedula", "tipo_persona", "telefono", "correo", "ciudad", "direccion", "pais", "tipo_cliente"],
                    },
                    {
                        model: Categoria_1.default,
                        as: "categoria",
                        attributes: ["nombre", "area_tipo"],
                    },
                ],
            });
            if (peticionesResueltas.length === 0) {
                return {
                    mensaje: "No hay peticiones resueltas para este periodo",
                    periodos_generados: 0,
                    total_peticiones: 0,
                    costo_total: 0,
                };
            }
            // 2. Agrupar por cliente_id
            const peticionesPorCliente = {};
            peticionesResueltas.forEach((peticion) => {
                const clienteId = peticion.cliente_id;
                if (!peticionesPorCliente[clienteId]) {
                    peticionesPorCliente[clienteId] = {
                        cliente: peticion.cliente,
                        peticiones: [],
                        costo_total: 0,
                    };
                }
                peticionesPorCliente[clienteId].peticiones.push(peticion);
                peticionesPorCliente[clienteId].costo_total += Number(peticion.costo);
            });
            // 3. Crear/actualizar periodo de facturación para cada cliente
            const periodosGenerados = [];
            let totalPeticiones = 0;
            let costoTotal = 0;
            for (const clienteId in peticionesPorCliente) {
                const data = peticionesPorCliente[clienteId];
                // Buscar si ya existe un periodo
                const [periodo, created] = yield PeriodoFacturacion_1.default.findOrCreate({
                    where: {
                        cliente_id: Number(clienteId),
                        año,
                        mes,
                    },
                    defaults: {
                        cliente_id: Number(clienteId),
                        año,
                        mes,
                        total_peticiones: data.peticiones.length,
                        costo_total: data.costo_total,
                        estado: "Abierto",
                    },
                });
                if (!created) {
                    // Si ya existía, actualizar con los nuevos totales
                    yield periodo.update({
                        total_peticiones: data.peticiones.length,
                        costo_total: data.costo_total,
                    });
                }
                periodosGenerados.push({
                    periodo_id: periodo.id,
                    cliente: data.cliente.nombre,
                    peticiones: data.peticiones.length,
                    costo: data.costo_total,
                    estado: created ? "Creado" : "Actualizado",
                });
                totalPeticiones += data.peticiones.length;
                costoTotal += data.costo_total;
            }
            console.log(`✅ Facturación automática generada: ${periodosGenerados.length} clientes, ${totalPeticiones} peticiones, $${costoTotal}`);
            return {
                mensaje: "Facturación automática generada exitosamente",
                periodos_generados: periodosGenerados.length,
                total_peticiones: totalPeticiones,
                costo_total: costoTotal,
                detalle: periodosGenerados,
            };
        });
    }
}
exports.FacturacionService = FacturacionService;
