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
exports.PeticionService = void 0;
const Peticion_1 = __importDefault(require("../models/Peticion"));
const PeticionHistorico_1 = __importDefault(require("../models/PeticionHistorico"));
const Cliente_1 = __importDefault(require("../models/Cliente"));
const Categoria_1 = __importDefault(require("../models/Categoria"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Area_1 = __importDefault(require("../models/Area"));
const error_util_1 = require("../utils/error.util");
const auditoria_service_1 = require("./auditoria.service");
const webSocket_service_1 = require("./webSocket.service");
const notificacion_service_1 = __importDefault(require("./notificacion.service"));
const sequelize_1 = require("sequelize");
class PeticionService {
    constructor() {
        this.auditoriaService = new auditoria_service_1.AuditoriaService();
    }
    crear(data, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el cliente existe
            const clienteData = yield Cliente_1.default.findByPk(data.cliente_id);
            if (!clienteData) {
                throw new error_util_1.NotFoundError("Cliente no encontrado");
            }
            // Verificar que la categoría existe
            const categoria = yield Categoria_1.default.findByPk(data.categoria_id);
            if (!categoria) {
                throw new error_util_1.NotFoundError("Categoría no encontrada");
            }
            // Si la categoría requiere descripción extra, validar que venga
            if (categoria.requiere_descripcion_extra && !data.descripcion_extra) {
                throw new error_util_1.ValidationError(`La categoría "${categoria.nombre}" requiere descripción adicional`);
            }
            // Si la categoría es variable, el costo debe venir en el request
            if (categoria.es_variable && !data.costo) {
                throw new error_util_1.ValidationError(`La categoría "${categoria.nombre}" requiere que especifiques el costo`);
            }
            // Si no es variable, tomar el costo de la categoría
            const costoFinal = categoria.es_variable ? data.costo : categoria.costo;
            // Determinar estado y asignación según el área
            let estadoInicial = "Pendiente";
            let usuarioAsignado = null;
            let fechaAceptacion = null;
            let temporizadorActivo = false;
            let fechaInicioTemporizador = null;
            // Si el área es "Pautas", asignar automáticamente al pautador del cliente
            if (data.area === "Pautas") {
                estadoInicial = "En Progreso";
                usuarioAsignado = clienteData.pautador_id;
                fechaAceptacion = new Date();
                temporizadorActivo = true;
                fechaInicioTemporizador = new Date();
            }
            // Crear la petición
            const peticion = yield Peticion_1.default.create({
                cliente_id: data.cliente_id,
                categoria_id: data.categoria_id,
                descripcion: data.descripcion,
                descripcion_extra: data.descripcion_extra,
                costo: costoFinal,
                area: data.area,
                estado: estadoInicial,
                creador_id: usuarioActual.uid,
                asignado_a: usuarioAsignado,
                fecha_aceptacion: fechaAceptacion,
                temporizador_activo: temporizadorActivo,
                fecha_inicio_temporizador: fechaInicioTemporizador,
            });
            // Registrar en auditoría
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: peticion.id,
                tipo_cambio: "INSERT",
                valor_nuevo: JSON.stringify({
                    cliente_id: data.cliente_id,
                    categoria_id: data.categoria_id,
                    area: data.area,
                    estado: estadoInicial,
                    asignado_a: usuarioAsignado,
                }),
                usuario_id: usuarioActual.uid,
                descripcion: data.area === "Pautas"
                    ? "Creación de petición de Pautas (auto-asignada)"
                    : "Creación de nueva petición",
            });
            // Obtener petición completa con relaciones
            const peticionCompleta = yield this.obtenerPorId(peticion.id);
            // Emitir evento WebSocket
            if (data.area === "Pautas") {
                // Si fue auto-asignada, emitir evento de aceptación
                // Obtener datos del usuario asignado
                const usuarioPautador = yield Usuario_1.default.findByPk(usuarioAsignado);
                webSocket_service_1.webSocketService.emitPeticionAceptada(peticion.id, usuarioAsignado, {
                    uid: usuarioPautador.uid,
                    nombre_completo: usuarioPautador.nombre_completo,
                    correo: usuarioPautador.correo,
                }, fechaAceptacion, null, 0);
                // Enviar notificación al pautador
                yield notificacion_service_1.default.notificarAsignacion(peticionCompleta, usuarioPautador, usuarioActual);
            }
            else {
                // Si es de Diseño, emitir evento de nueva petición
                webSocket_service_1.webSocketService.emitNuevaPeticion(peticionCompleta);
            }
            return peticionCompleta;
        });
    }
    obtenerTodos(usuarioActual, filtros) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = {};
            // Aplicar filtros de estado si vienen
            if (filtros === null || filtros === void 0 ? void 0 : filtros.estado) {
                whereClause.estado = filtros.estado;
            }
            // Aplicar filtros de cliente si vienen
            if (filtros === null || filtros === void 0 ? void 0 : filtros.cliente_id) {
                whereClause.cliente_id = filtros.cliente_id;
            }
            // Aplicar filtro por área si viene (para filtrar Pautas vs Diseño)
            if (filtros === null || filtros === void 0 ? void 0 : filtros.area) {
                whereClause.area = filtros.area;
            }
            // Permisos según rol
            if (usuarioActual.rol === "Usuario") {
                const area = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
                if ((area === null || area === void 0 ? void 0 : area.nombre) === "Pautas" || (area === null || area === void 0 ? void 0 : area.nombre) === "Diseño") {
                    // Usuario puede ver las que creó o las que le fueron asignadas
                    whereClause[sequelize_1.Op.or] = [
                        { creador_id: usuarioActual.uid },
                        { asignado_a: usuarioActual.uid },
                    ];
                }
                else {
                    // Otras áreas solo las que crearon
                    whereClause.creador_id = usuarioActual.uid;
                }
            }
            if (["Líder", "Directivo"].includes(usuarioActual.rol)) {
                const area = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
                // Obtener usuarios del área
                const usuariosArea = yield Usuario_1.default.findAll({
                    where: { area_id: area === null || area === void 0 ? void 0 : area.id },
                    attributes: ["uid"],
                });
                const idsUsuariosArea = usuariosArea.map((u) => u.uid);
                // Ver peticiones creadas o asignadas a usuarios de su área
                whereClause[sequelize_1.Op.or] = [
                    { creador_id: idsUsuariosArea },
                    { asignado_a: idsUsuariosArea },
                ];
            }
            const peticiones = yield Peticion_1.default.findAll({
                where: whereClause,
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "pais"],
                    },
                    {
                        model: Categoria_1.default,
                        as: "categoria",
                        attributes: ["id", "nombre", "area_tipo", "costo"],
                    },
                    {
                        model: Usuario_1.default,
                        as: "creador",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                    {
                        model: Usuario_1.default,
                        as: "asignado",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                ],
                order: [["fecha_creacion", "DESC"]],
            });
            // Calcular tiempo empleado dinámicamente para peticiones con temporizador activo
            const peticionesConTiempo = peticiones.map((peticion) => {
                const peticionJSON = peticion.toJSON();
                if (peticion.temporizador_activo && peticion.fecha_inicio_temporizador) {
                    const ahora = new Date();
                    const tiempoTranscurrido = Math.floor((ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000);
                    peticionJSON.tiempo_empleado_actual = peticion.tiempo_empleado_segundos + tiempoTranscurrido;
                }
                else {
                    peticionJSON.tiempo_empleado_actual = peticion.tiempo_empleado_segundos;
                }
                return peticionJSON;
            });
            return peticionesConTiempo;
        });
    }
    obtenerPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id, {
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre", "pais"],
                    },
                    {
                        model: Categoria_1.default,
                        as: "categoria",
                        attributes: ["id", "nombre", "area_tipo", "costo", "es_variable"],
                    },
                    {
                        model: Usuario_1.default,
                        as: "creador",
                        attributes: ["uid", "nombre_completo", "correo"],
                        include: [{ model: Area_1.default, as: "area", attributes: ["nombre"] }],
                    },
                    {
                        model: Usuario_1.default,
                        as: "asignado",
                        attributes: ["uid", "nombre_completo", "correo"],
                        include: [{ model: Area_1.default, as: "area", attributes: ["nombre"] }],
                    },
                ],
            });
            if (!peticion) {
                throw new error_util_1.NotFoundError("Petición no encontrada");
            }
            // Calcular tiempo empleado dinámicamente
            const peticionJSON = peticion.toJSON();
            if (peticion.temporizador_activo && peticion.fecha_inicio_temporizador) {
                const ahora = new Date();
                const tiempoTranscurrido = Math.floor((ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000);
                peticionJSON.tiempo_empleado_actual = peticion.tiempo_empleado_segundos + tiempoTranscurrido;
            }
            else {
                peticionJSON.tiempo_empleado_actual = peticion.tiempo_empleado_segundos;
            }
            return peticionJSON;
        });
    }
    obtenerPendientes(area) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { estado: "Pendiente" };
            if (area) {
                const categoria = yield Categoria_1.default.findAll({
                    where: { area_tipo: area },
                    attributes: ["id"],
                });
                const categoriasIds = categoria.map((c) => c.id);
                whereClause.categoria_id = categoriasIds;
            }
            return yield Peticion_1.default.findAll({
                where: whereClause,
                include: [
                    {
                        model: Cliente_1.default,
                        as: "cliente",
                        attributes: ["id", "nombre"],
                    },
                    {
                        model: Categoria_1.default,
                        as: "categoria",
                        attributes: ["id", "nombre", "area_tipo"],
                    },
                    {
                        model: Usuario_1.default,
                        as: "creador",
                        attributes: ["uid", "nombre_completo"],
                    },
                ],
                order: [["fecha_creacion", "ASC"]],
            });
        });
    }
    aceptarPeticion(id, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id);
            if (!peticion) {
                throw new error_util_1.NotFoundError("Petición no encontrada");
            }
            if (peticion.estado !== "Pendiente") {
                throw new error_util_1.ValidationError("Solo se pueden aceptar peticiones pendientes");
            }
            // Verificar que el usuario sea del área correcta
            const categoria = yield Categoria_1.default.findByPk(peticion.categoria_id);
            const usuarioArea = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
            if ((categoria === null || categoria === void 0 ? void 0 : categoria.area_tipo) !== (usuarioArea === null || usuarioArea === void 0 ? void 0 : usuarioArea.nombre)) {
                throw new error_util_1.ForbiddenError(`Solo usuarios del área de ${categoria === null || categoria === void 0 ? void 0 : categoria.area_tipo} pueden aceptar esta petición`);
            }
            // Iniciar temporizador automáticamente
            const fecha_aceptacion = new Date();
            yield peticion.update({
                estado: "En Progreso",
                asignado_a: usuarioActual.uid,
                fecha_aceptacion,
                temporizador_activo: true,
                fecha_inicio_temporizador: fecha_aceptacion,
                tiempo_empleado_segundos: 0,
            });
            // Registrar en auditoría
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "ASIGNACION",
                campo_modificado: "asignado_a",
                valor_anterior: "null",
                valor_nuevo: usuarioActual.uid.toString(),
                usuario_id: usuarioActual.uid,
                descripcion: `Petición aceptada - Temporizador iniciado`,
            });
            // Obtener petición actualizada con relaciones
            const peticionActualizada = yield this.obtenerPorId(id);
            // Emitir evento WebSocket de petición aceptada
            webSocket_service_1.webSocketService.emitPeticionAceptada(id, usuarioActual.uid, {
                uid: usuarioActual.uid,
                nombre_completo: usuarioActual.nombre_completo,
                email: usuarioActual.email,
            }, fecha_aceptacion, null, // ya no hay fecha_limite
            0 // ya no hay tiempo_limite_horas
            );
            // Enviar notificación al creador de la petición
            const cliente = yield Cliente_1.default.findByPk(peticion.cliente_id);
            const creador = yield Usuario_1.default.findByPk(peticion.creador_id);
            if (creador) {
                yield notificacion_service_1.default.crear({
                    usuario_id: creador.uid,
                    tipo: "cambio_estado",
                    titulo: "Petición aceptada",
                    mensaje: `${usuarioActual.nombre_completo} ha aceptado la petición de ${(cliente === null || cliente === void 0 ? void 0 : cliente.nombre) || "un cliente"}`,
                    peticion_id: peticion.id,
                });
            }
            return peticionActualizada;
        });
    }
    cambiarEstado(id, nuevoEstado, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id);
            if (!peticion) {
                throw new error_util_1.NotFoundError("Petición no encontrada");
            }
            // Validar transiciones de estado
            const estadoAnterior = peticion.estado;
            if (estadoAnterior === "Resuelta" || estadoAnterior === "Cancelada") {
                throw new error_util_1.ValidationError("No se puede cambiar el estado de una petición resuelta o cancelada");
            }
            // Solo quien está asignado o creó la petición puede cambiar el estado
            if (peticion.asignado_a !== usuarioActual.uid &&
                peticion.creador_id !== usuarioActual.uid &&
                !["Admin", "Directivo", "Líder"].includes(usuarioActual.rol)) {
                throw new error_util_1.ForbiddenError("No tienes permiso para cambiar el estado de esta petición");
            }
            // Si se marca como resuelta o cancelada, establecer fecha_resolucion
            const updateData = { estado: nuevoEstado };
            if (nuevoEstado === "Resuelta" || nuevoEstado === "Cancelada") {
                updateData.fecha_resolucion = new Date();
            }
            yield peticion.update(updateData);
            // Registrar en auditoría
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "CAMBIO_ESTADO",
                campo_modificado: "estado",
                valor_anterior: estadoAnterior,
                valor_nuevo: nuevoEstado,
                usuario_id: usuarioActual.uid,
                descripcion: `Cambio de estado de ${estadoAnterior} a ${nuevoEstado}`,
            });
            // Emitir evento WebSocket de cambio de estado
            webSocket_service_1.webSocketService.emitCambioEstado(id, nuevoEstado, nuevoEstado === "Resuelta" ? updateData.fecha_resolucion : undefined);
            // Si se marca como Resuelta o Cancelada, mover al histórico
            if (nuevoEstado === "Resuelta" || nuevoEstado === "Cancelada") {
                yield this.moverAHistorico(peticion);
            }
            return yield this.obtenerPorId(id);
        });
    }
    actualizar(id, data, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id);
            if (!peticion) {
                throw new error_util_1.NotFoundError("Petición no encontrada");
            }
            // Solo el creador o admin pueden actualizar
            if (peticion.creador_id !== usuarioActual.uid &&
                !["Admin", "Directivo"].includes(usuarioActual.rol)) {
                throw new error_util_1.ForbiddenError("No tienes permiso para actualizar esta petición");
            }
            // No permitir cambios si ya está resuelta o cancelada
            if (["Resuelta", "Cancelada"].includes(peticion.estado)) {
                throw new error_util_1.ValidationError("No se puede actualizar una petición resuelta o cancelada");
            }
            yield peticion.update(data);
            // Registrar en auditoría
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "UPDATE",
                valor_anterior: JSON.stringify(peticion),
                valor_nuevo: JSON.stringify(data),
                usuario_id: usuarioActual.uid,
                descripcion: "Actualización de petición",
            });
            return yield this.obtenerPorId(id);
        });
    }
    obtenerPorClienteYMes(cliente_id, año, mes) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechaInicio = new Date(año, mes - 1, 1);
            const fechaFin = new Date(año, mes, 0, 23, 59, 59);
            const peticiones = yield Peticion_1.default.findAll({
                where: {
                    cliente_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
                include: [
                    { model: Categoria_1.default, as: "categoria", attributes: ["nombre", "area_tipo"] },
                    { model: Usuario_1.default, as: "creador", attributes: ["nombre_completo"] },
                    { model: Usuario_1.default, as: "asignado", attributes: ["nombre_completo"] },
                ],
            });
            // También buscar en el histórico
            const peticionesHistorico = yield PeticionHistorico_1.default.findAll({
                where: {
                    cliente_id,
                    fecha_creacion: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
                include: [
                    { model: Categoria_1.default, as: "categoria", attributes: ["nombre", "area_tipo"] },
                    { model: Usuario_1.default, as: "creador", attributes: ["nombre_completo"] },
                    { model: Usuario_1.default, as: "asignado", attributes: ["nombre_completo"] },
                ],
            });
            const todasPeticiones = [...peticiones, ...peticionesHistorico];
            const totalCosto = todasPeticiones.reduce((sum, p) => sum + Number(p.costo), 0);
            return {
                peticiones: todasPeticiones,
                resumen: {
                    total_peticiones: todasPeticiones.length,
                    costo_total: totalCosto,
                    por_estado: {
                        pendientes: peticiones.filter((p) => p.estado === "Pendiente").length,
                        en_progreso: peticiones.filter((p) => p.estado === "En Progreso").length,
                        resueltas: peticionesHistorico.filter((p) => p.estado === "Resuelta").length,
                        canceladas: peticionesHistorico.filter((p) => p.estado === "Cancelada").length,
                    },
                },
            };
        });
    }
    moverAHistorico(peticion) {
        return __awaiter(this, void 0, void 0, function* () {
            // Asegurar que tenga fecha_resolucion (por si acaso)
            if (!peticion.fecha_resolucion) {
                peticion.fecha_resolucion = new Date();
                yield peticion.save();
            }
            // Copiar a histórico
            yield PeticionHistorico_1.default.create({
                peticion_id_original: peticion.id,
                cliente_id: peticion.cliente_id,
                categoria_id: peticion.categoria_id,
                descripcion: peticion.descripcion,
                descripcion_extra: peticion.descripcion_extra,
                costo: peticion.costo,
                estado: peticion.estado,
                creador_id: peticion.creador_id,
                asignado_a: peticion.asignado_a,
                fecha_creacion: peticion.fecha_creacion,
                fecha_aceptacion: peticion.fecha_aceptacion,
                fecha_resolucion: peticion.fecha_resolucion,
                tiempo_empleado_segundos: peticion.tiempo_empleado_segundos,
            });
            // Eliminar de la tabla de peticiones activas
            yield peticion.destroy();
            console.log(`✅ Petición ${peticion.id} movida al histórico`);
        });
    }
    obtenerHistorico(filtros, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = {};
            // Si el usuario no es Admin, solo puede ver:
            // - Peticiones que él creó (creador_id)
            // - Peticiones que le fueron asignadas (asignado_a)
            if (usuarioActual && usuarioActual.role !== "Admin") {
                whereClause[sequelize_1.Op.or] = [
                    { creador_id: usuarioActual.uid },
                    { asignado_a: usuarioActual.uid },
                ];
            }
            if (filtros === null || filtros === void 0 ? void 0 : filtros.cliente_id) {
                whereClause.cliente_id = filtros.cliente_id;
            }
            if (filtros === null || filtros === void 0 ? void 0 : filtros.estado) {
                whereClause.estado = filtros.estado;
            }
            if ((filtros === null || filtros === void 0 ? void 0 : filtros.año) && (filtros === null || filtros === void 0 ? void 0 : filtros.mes)) {
                const fechaInicio = new Date(filtros.año, filtros.mes - 1, 1);
                const fechaFin = new Date(filtros.año, filtros.mes, 0, 23, 59, 59);
                whereClause.fecha_resolucion = {
                    [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                };
            }
            return yield PeticionHistorico_1.default.findAll({
                where: whereClause,
                include: [
                    { model: Cliente_1.default, as: "cliente", attributes: ["id", "nombre"] },
                    { model: Categoria_1.default, as: "categoria", attributes: ["id", "nombre", "area_tipo"] },
                    { model: Usuario_1.default, as: "creador", attributes: ["uid", "nombre_completo"] },
                    { model: Usuario_1.default, as: "asignado", attributes: ["uid", "nombre_completo"] },
                ],
                order: [["fecha_resolucion", "DESC"]],
            });
        });
    }
    /**
     * Obtener resumen global de peticiones (activas + históricas)
     * Útil para dashboards de administradores
     */
    obtenerResumenGlobal() {
        return __awaiter(this, void 0, void 0, function* () {
            // Contar peticiones activas
            const peticionesActivas = yield Peticion_1.default.findAll();
            // Contar peticiones históricas
            const peticionesHistoricas = yield PeticionHistorico_1.default.findAll();
            // Totales
            const totalPeticiones = peticionesActivas.length + peticionesHistoricas.length;
            // Por estado
            const pendientes = peticionesActivas.filter((p) => p.estado === "Pendiente").length;
            const enProgreso = peticionesActivas.filter((p) => p.estado === "En Progreso").length;
            const resueltas = peticionesHistoricas.filter((p) => p.estado === "Resuelta").length;
            const canceladas = peticionesHistoricas.filter((p) => p.estado === "Cancelada").length;
            // Costo total
            const costoActivas = peticionesActivas.reduce((sum, p) => sum + Number(p.costo), 0);
            const costoHistoricas = peticionesHistoricas.reduce((sum, p) => sum + Number(p.costo), 0);
            const costoTotal = costoActivas + costoHistoricas;
            return {
                total_peticiones: totalPeticiones,
                por_estado: {
                    pendientes,
                    en_progreso: enProgreso,
                    resueltas,
                    canceladas,
                },
                costo_total: costoTotal,
                activas: peticionesActivas.length,
                historicas: peticionesHistoricas.length,
            };
        });
    }
    // ====== MÉTODOS DE CONTROL DE TEMPORIZADOR ======
    pausarTemporizador(id, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id);
            if (!peticion)
                throw new error_util_1.NotFoundError("Petición no encontrada");
            if (peticion.asignado_a !== usuarioActual.uid) {
                throw new error_util_1.ForbiddenError("Solo puedes pausar peticiones asignadas a ti");
            }
            if (!peticion.temporizador_activo) {
                throw new error_util_1.ValidationError("El temporizador no está activo");
            }
            const ahora = new Date();
            const tiempoTranscurridoSegundos = Math.floor((ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000);
            const nuevoTiempoTotal = peticion.tiempo_empleado_segundos + tiempoTranscurridoSegundos;
            yield peticion.update({
                temporizador_activo: false,
                tiempo_empleado_segundos: nuevoTiempoTotal,
                fecha_pausa_temporizador: ahora,
            });
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "UPDATE",
                campo_modificado: "temporizador_activo",
                valor_anterior: "true",
                valor_nuevo: "false",
                usuario_id: usuarioActual.uid,
                descripcion: `Temporizador pausado`,
            });
            const peticionActualizada = yield this.obtenerPorId(id);
            webSocket_service_1.webSocketService.emitCambioEstado(id, peticion.estado, usuarioActual.uid);
            return peticionActualizada;
        });
    }
    reanudarTemporizador(id, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id);
            if (!peticion)
                throw new error_util_1.NotFoundError("Petición no encontrada");
            if (peticion.asignado_a !== usuarioActual.uid) {
                throw new error_util_1.ForbiddenError("Solo puedes reanudar peticiones asignadas a ti");
            }
            if (peticion.temporizador_activo) {
                throw new error_util_1.ValidationError("El temporizador ya está activo");
            }
            if (peticion.estado !== "En Progreso") {
                throw new error_util_1.ValidationError("Solo se pueden reanudar peticiones en progreso");
            }
            const ahora = new Date();
            yield peticion.update({
                temporizador_activo: true,
                fecha_inicio_temporizador: ahora,
            });
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "UPDATE",
                campo_modificado: "temporizador_activo",
                valor_anterior: "false",
                valor_nuevo: "true",
                usuario_id: usuarioActual.uid,
                descripcion: `Temporizador reanudado`,
            });
            const peticionActualizada = yield this.obtenerPorId(id);
            webSocket_service_1.webSocketService.emitCambioEstado(id, peticion.estado, usuarioActual.uid);
            return peticionActualizada;
        });
    }
    obtenerTiempoEmpleado(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id);
            if (!peticion)
                throw new error_util_1.NotFoundError("Petición no encontrada");
            let tiempoTotal = peticion.tiempo_empleado_segundos;
            if (peticion.temporizador_activo && peticion.fecha_inicio_temporizador) {
                const ahora = new Date();
                const tiempoTranscurrido = Math.floor((ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000);
                tiempoTotal += tiempoTranscurrido;
            }
            return {
                tiempo_empleado_segundos: tiempoTotal,
                tiempo_empleado_formato: this.formatearTiempo(tiempoTotal),
                temporizador_activo: peticion.temporizador_activo,
            };
        });
    }
    formatearTiempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
}
exports.PeticionService = PeticionService;
