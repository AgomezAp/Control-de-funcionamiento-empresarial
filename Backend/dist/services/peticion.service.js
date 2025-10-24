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
const estadistica_service_1 = require("./estadistica.service");
const webSocket_service_1 = require("./webSocket.service");
const notificacion_service_1 = __importDefault(require("./notificacion.service"));
const sequelize_1 = require("sequelize");
class PeticionService {
    constructor() {
        this.auditoriaService = new auditoria_service_1.AuditoriaService();
        this.estadisticaService = new estadistica_service_1.EstadisticaService();
    }
    crear(data, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
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
            // EXCEPCIÓN: No validar para Gestión Administrativa
            if (categoria.requiere_descripcion_extra && !data.descripcion_extra && data.area !== "Gestión Administrativa") {
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
                // Verificar que el pautador esté activo (status = true)
                const pautador = yield Usuario_1.default.findByPk(clienteData.pautador_id);
                if (pautador && pautador.status === true) {
                    estadoInicial = "En Progreso";
                    usuarioAsignado = clienteData.pautador_id;
                    fechaAceptacion = new Date();
                    temporizadorActivo = true;
                    fechaInicioTemporizador = new Date();
                }
                else {
                    // Si el pautador está inactivo, la petición queda pendiente
                    console.warn(`⚠️ Pautador ${clienteData.pautador_id} está inactivo, petición queda pendiente`);
                }
            }
            // Si el área es "Gestión Administrativa", queda pendiente (sin auto-asignación)
            // Los usuarios de Gestión Administrativa aceptan manualmente sus peticiones
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
            else if (data.area === "Diseño") {
                // Si es de Diseño, emitir evento de nueva petición
                webSocket_service_1.webSocketService.emitNuevaPeticion(peticionCompleta);
                // Notificar a todos los diseñadores activos
                const areaDiseño = yield Area_1.default.findOne({ where: { nombre: "Diseño" } });
                console.log('🔍 Área Diseño encontrada:', areaDiseño === null || areaDiseño === void 0 ? void 0 : areaDiseño.id);
                if (areaDiseño) {
                    const diseñadores = yield Usuario_1.default.findAll({
                        where: {
                            area_id: areaDiseño.id,
                            status: true
                        }
                    });
                    console.log(`📢 Enviando notificaciones a ${diseñadores.length} diseñadores`);
                    // Enviar notificación a cada diseñador
                    for (const diseñador of diseñadores) {
                        console.log(`  → Notificando a: ${diseñador.nombre_completo} (ID: ${diseñador.uid})`);
                        yield notificacion_service_1.default.crear({
                            usuario_id: diseñador.uid,
                            tipo: "sistema",
                            titulo: "Nueva petición de diseño disponible",
                            mensaje: `${usuarioActual.nombre_completo} ha creado una nueva petición de ${((_a = peticionCompleta.cliente) === null || _a === void 0 ? void 0 : _a.nombre) || "un cliente"}`,
                            peticion_id: peticion.id,
                        });
                    }
                    console.log('✅ Notificaciones enviadas correctamente');
                }
                else {
                    console.log('⚠️ No se encontró el área de Diseño');
                }
            }
            else if (data.area === "Gestión Administrativa") {
                // Si es de Gestión Administrativa, emitir evento de nueva petición
                webSocket_service_1.webSocketService.emitNuevaPeticion(peticionCompleta);
                // Notificar a todos los usuarios de Gestión Administrativa activos
                const areaGestion = yield Area_1.default.findOne({ where: { nombre: "Gestión Administrativa" } });
                console.log('🔍 Área Gestión Administrativa encontrada:', areaGestion === null || areaGestion === void 0 ? void 0 : areaGestion.id);
                if (areaGestion) {
                    const usuariosGestion = yield Usuario_1.default.findAll({
                        where: {
                            area_id: areaGestion.id,
                            status: true
                        }
                    });
                    console.log(`📢 Enviando notificaciones a ${usuariosGestion.length} usuarios de Gestión Administrativa`);
                    // Enviar notificación a cada usuario de Gestión Administrativa
                    for (const usuario of usuariosGestion) {
                        console.log(`  → Notificando a: ${usuario.nombre_completo} (ID: ${usuario.uid})`);
                        yield notificacion_service_1.default.crear({
                            usuario_id: usuario.uid,
                            tipo: "sistema",
                            titulo: "Nueva petición administrativa disponible",
                            mensaje: `${usuarioActual.nombre_completo} ha creado una nueva petición de ${((_b = peticionCompleta.cliente) === null || _b === void 0 ? void 0 : _b.nombre) || "un cliente"}`,
                            peticion_id: peticion.id,
                        });
                    }
                    console.log('✅ Notificaciones enviadas correctamente');
                }
                else {
                    console.log('⚠️ No se encontró el área de Gestión Administrativa');
                }
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
                if ((area === null || area === void 0 ? void 0 : area.nombre) === "Pautas" || (area === null || area === void 0 ? void 0 : area.nombre) === "Diseño" || (area === null || area === void 0 ? void 0 : area.nombre) === "Gestión Administrativa") {
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
            const includeOptions = [
                {
                    model: Cliente_1.default,
                    as: "cliente",
                    attributes: ["id", "nombre", "pais", "tipo_cliente"],
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
            ];
            // ✅ Buscar primero en peticiones activas por ID
            let peticion = yield Peticion_1.default.findByPk(id, { include: includeOptions });
            // ✅ Si no se encuentra, buscar en histórico por peticion_id_original
            if (!peticion) {
                peticion = (yield PeticionHistorico_1.default.findOne({
                    where: { peticion_id_original: id },
                    include: includeOptions
                }));
            }
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
            // ✅ CORRECCIÓN: Filtrar directamente por el campo "area" de la petición
            // en lugar de por categorías (permite filtrar Pautas correctamente)
            if (area) {
                // Si el área es "Pautas", mostrar peticiones de Pautas Y Gestión Administrativa
                if (area === "Pautas") {
                    whereClause.area = ["Pautas", "Gestión Administrativa"];
                }
                else {
                    // Para Diseño u otras áreas, solo mostrar sus propias peticiones
                    whereClause.area = area;
                }
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
            // ✅ CORRECCIÓN: Verificar permisos según el área de la petición
            const usuarioArea = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
            // Los pautadores pueden aceptar peticiones de Pautas Y Gestión Administrativa
            if ((usuarioArea === null || usuarioArea === void 0 ? void 0 : usuarioArea.nombre) === "Pautas") {
                if (peticion.area !== "Pautas" && peticion.area !== "Gestión Administrativa") {
                    throw new error_util_1.ForbiddenError(`Solo usuarios de Pautas pueden aceptar peticiones de Pautas y Gestión Administrativa`);
                }
            }
            else {
                // Otras áreas solo pueden aceptar sus propias peticiones
                if (peticion.area !== (usuarioArea === null || usuarioArea === void 0 ? void 0 : usuarioArea.nombre)) {
                    throw new error_util_1.ForbiddenError(`Solo usuarios del área de ${peticion.area} pueden aceptar esta petición`);
                }
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
            // Enviar notificación al usuario que aceptó la petición
            yield notificacion_service_1.default.notificarAsignacion(peticionActualizada, usuarioActual, creador || usuarioActual);
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
            // Detectar si se está asignando a un usuario (asignación manual)
            const asignacionManual = data.asignado_a && peticion.asignado_a !== data.asignado_a;
            const usuarioAsignado = asignacionManual ? yield Usuario_1.default.findByPk(data.asignado_a) : null;
            yield peticion.update(data);
            // Registrar en auditoría
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "UPDATE",
                valor_anterior: JSON.stringify(peticion),
                valor_nuevo: JSON.stringify(data),
                usuario_id: usuarioActual.uid,
                descripcion: asignacionManual ? "Asignación manual de petición" : "Actualización de petición",
            });
            // Si fue asignación manual, enviar notificación
            if (asignacionManual && usuarioAsignado) {
                const peticionCompleta = yield this.obtenerPorId(id);
                yield notificacion_service_1.default.notificarAsignacion(peticionCompleta, usuarioAsignado, usuarioActual);
                // Emitir evento WebSocket - usar emitPeticionAceptada porque es similar
                webSocket_service_1.webSocketService.emitPeticionAceptada(id, usuarioAsignado.uid, {
                    uid: usuarioAsignado.uid,
                    nombre_completo: usuarioAsignado.nombre_completo,
                    correo: usuarioAsignado.correo,
                }, new Date(), null, 0);
            }
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
            // Recalcular estadísticas del usuario asignado y del creador
            const fechaResolucion = peticion.fecha_resolucion;
            const año = fechaResolucion.getFullYear();
            const mes = fechaResolucion.getMonth() + 1;
            // Recalcular para el usuario asignado (si existe)
            if (peticion.asignado_a) {
                try {
                    yield this.estadisticaService.calcularEstadisticasUsuario(peticion.asignado_a, año, mes);
                    console.log(`✅ Estadísticas actualizadas para usuario ${peticion.asignado_a}`);
                }
                catch (error) {
                    console.error(`❌ Error al actualizar estadísticas del usuario ${peticion.asignado_a}:`, error);
                }
            }
            // Recalcular para el creador
            if (peticion.creador_id) {
                try {
                    yield this.estadisticaService.calcularEstadisticasUsuario(peticion.creador_id, año, mes);
                    console.log(`✅ Estadísticas actualizadas para creador ${peticion.creador_id}`);
                }
                catch (error) {
                    console.error(`❌ Error al actualizar estadísticas del creador ${peticion.creador_id}:`, error);
                }
            }
        });
    }
    obtenerHistorico(filtros, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = {};
            // Admin puede ver todo el histórico
            if (usuarioActual && usuarioActual.rol !== "Admin") {
                // Líder puede ver todas las peticiones históricas de su área
                if (usuarioActual.rol === "Líder") {
                    whereClause.area = usuarioActual.area;
                }
                else {
                    // Usuario solo puede ver peticiones que creó o que le fueron asignadas
                    whereClause[sequelize_1.Op.or] = [
                        { creador_id: usuarioActual.uid },
                        { asignado_a: usuarioActual.uid },
                    ];
                }
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
            const peticiones = yield PeticionHistorico_1.default.findAll({
                where: whereClause,
                include: [
                    { model: Cliente_1.default, as: "cliente", attributes: ["id", "nombre"] },
                    { model: Categoria_1.default, as: "categoria", attributes: ["id", "nombre", "area_tipo"] },
                    { model: Usuario_1.default, as: "creador", attributes: ["uid", "nombre_completo"] },
                    { model: Usuario_1.default, as: "asignado", attributes: ["uid", "nombre_completo"] },
                ],
                order: [["fecha_resolucion", "DESC"]],
            });
            // ✅ Transformar la respuesta para que el ID visible sea el peticion_id_original
            return peticiones.map((peticion) => {
                const peticionObj = peticion.toJSON();
                return Object.assign(Object.assign({}, peticionObj), { id: peticionObj.peticion_id_original });
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
            const pausadas = peticionesActivas.filter((p) => p.estado === "Pausada").length; // ✅ NUEVO
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
                    pausadas, // ✅ NUEVO
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
            // Validar permisos: Solo el asignado, Admin, Directivo o Líder pueden pausar
            const esAsignado = peticion.asignado_a === usuarioActual.uid;
            const tienePemisoEspecial = ["Admin", "Directivo", "Líder"].includes(usuarioActual.rol);
            console.log('🔍 pausarTemporizador - Verificación de permisos:', {
                peticionId: id,
                asignado_a: peticion.asignado_a,
                usuarioActual: {
                    uid: usuarioActual.uid,
                    rol: usuarioActual.rol
                },
                esAsignado,
                tienePemisoEspecial
            });
            if (!esAsignado && !tienePemisoEspecial) {
                throw new error_util_1.ForbiddenError("No tienes permiso para pausar esta petición");
            }
            if (!peticion.temporizador_activo) {
                throw new error_util_1.ValidationError("El temporizador no está activo");
            }
            if (peticion.estado !== "En Progreso") {
                throw new error_util_1.ValidationError("Solo se pueden pausar peticiones en progreso");
            }
            const ahora = new Date();
            const tiempoTranscurridoSegundos = Math.floor((ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000);
            const nuevoTiempoTotal = peticion.tiempo_empleado_segundos + tiempoTranscurridoSegundos;
            yield peticion.update({
                estado: "Pausada",
                temporizador_activo: false,
                tiempo_empleado_segundos: nuevoTiempoTotal,
                fecha_pausa_temporizador: ahora,
            });
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "UPDATE",
                campo_modificado: "estado",
                valor_anterior: "En Progreso",
                valor_nuevo: "Pausada",
                usuario_id: usuarioActual.uid,
                descripcion: `Temporizador pausado - Estado cambiado a Pausada`,
            });
            const peticionActualizada = yield this.obtenerPorId(id);
            webSocket_service_1.webSocketService.emitCambioEstado(id, "Pausada", usuarioActual.uid);
            return peticionActualizada;
        });
    }
    reanudarTemporizador(id, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const peticion = yield Peticion_1.default.findByPk(id);
            if (!peticion)
                throw new error_util_1.NotFoundError("Petición no encontrada");
            // Validar permisos: Solo el asignado, Admin, Directivo o Líder pueden reanudar
            const esAsignado = peticion.asignado_a === usuarioActual.uid;
            const tienePemisoEspecial = ["Admin", "Directivo", "Líder"].includes(usuarioActual.rol);
            console.log('🔍 reanudarTemporizador - Verificación de permisos:', {
                peticionId: id,
                asignado_a: peticion.asignado_a,
                usuarioActual: {
                    uid: usuarioActual.uid,
                    rol: usuarioActual.rol
                },
                esAsignado,
                tienePemisoEspecial
            });
            if (!esAsignado && !tienePemisoEspecial) {
                throw new error_util_1.ForbiddenError("No tienes permiso para reanudar esta petición");
            }
            if (peticion.temporizador_activo) {
                throw new error_util_1.ValidationError("El temporizador ya está activo");
            }
            if (peticion.estado !== "Pausada") {
                throw new error_util_1.ValidationError("Solo se pueden reanudar peticiones pausadas");
            }
            const ahora = new Date();
            yield peticion.update({
                estado: "En Progreso",
                temporizador_activo: true,
                fecha_inicio_temporizador: ahora,
            });
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "peticiones",
                registro_id: id,
                tipo_cambio: "UPDATE",
                campo_modificado: "estado",
                valor_anterior: "Pausada",
                valor_nuevo: "En Progreso",
                usuario_id: usuarioActual.uid,
                descripcion: `Temporizador reanudado - Estado cambiado a En Progreso`,
            });
            const peticionActualizada = yield this.obtenerPorId(id);
            webSocket_service_1.webSocketService.emitCambioEstado(id, "En Progreso", usuarioActual.uid);
            return peticionActualizada;
        });
    }
    /**
     * Transferir peticiones de un usuario a otro(s)
     * Distribuye las peticiones equitativamente entre los usuarios destino
     */
    transferirPeticiones(usuarioOrigenId, peticionesIds, usuariosDestinoIds, motivo, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar permisos (Admin, Directivo, Líder)
            const rolesPermitidos = ["Admin", "Directivo", "Líder"];
            if (!rolesPermitidos.includes(usuarioActual.rol)) {
                throw new error_util_1.ForbiddenError("No tienes permisos para transferir peticiones");
            }
            // Verificar que el usuario origen existe
            const usuarioOrigen = yield Usuario_1.default.findByPk(usuarioOrigenId);
            if (!usuarioOrigen) {
                throw new error_util_1.NotFoundError("Usuario origen no encontrado");
            }
            // Verificar que todos los usuarios destino existen y están activos
            const usuariosDestino = yield Usuario_1.default.findAll({
                where: {
                    uid: usuariosDestinoIds,
                    status: true, // Solo usuarios activos
                },
            });
            if (usuariosDestino.length !== usuariosDestinoIds.length) {
                throw new error_util_1.ValidationError("Uno o más usuarios destino no existen o están inactivos");
            }
            // Obtener las peticiones a transferir
            const peticiones = yield Peticion_1.default.findAll({
                where: {
                    id: peticionesIds,
                    asignado_a: usuarioOrigenId,
                    estado: {
                        [sequelize_1.Op.in]: ["Pendiente", "En Progreso", "Pausada"], // No transferir resueltas/canceladas
                    },
                },
                include: [
                    { model: Cliente_1.default, as: "cliente" },
                    { model: Categoria_1.default, as: "categoria" },
                ],
            });
            if (peticiones.length === 0) {
                throw new error_util_1.ValidationError("No hay peticiones válidas para transferir");
            }
            if (peticiones.length !== peticionesIds.length) {
                throw new error_util_1.ValidationError("Algunas peticiones no existen, no pertenecen al usuario origen o ya están finalizadas");
            }
            // Distribuir peticiones equitativamente entre usuarios destino
            const peticionesTransferidas = [];
            const usuariosConPeticiones = new Map(); // uid -> cantidad
            // Inicializar contador para cada usuario destino
            usuariosDestinoIds.forEach(uid => usuariosConPeticiones.set(uid, 0));
            // Distribuir peticiones de forma round-robin
            let indiceUsuarioActual = 0;
            for (const peticion of peticiones) {
                const usuarioDestinoId = usuariosDestinoIds[indiceUsuarioActual];
                const usuarioDestino = usuariosDestino.find(u => u.uid === usuarioDestinoId);
                // Actualizar asignación
                yield peticion.update(Object.assign({ asignado_a: usuarioDestinoId }, (peticion.temporizador_activo && {
                    temporizador_activo: false,
                    fecha_pausa_temporizador: new Date(),
                    tiempo_empleado_segundos: yield this.calcularTiempoEmpleado(peticion),
                })));
                // Registrar auditoría
                yield this.auditoriaService.registrarCambio({
                    tabla_afectada: "peticiones",
                    registro_id: peticion.id,
                    tipo_cambio: "ASIGNACION",
                    campo_modificado: "asignado_a",
                    valor_anterior: usuarioOrigenId.toString(),
                    valor_nuevo: usuarioDestinoId.toString(),
                    usuario_id: usuarioActual.uid,
                    descripcion: `Transferencia de petición: ${motivo}`,
                });
                // Crear notificación para el usuario destino
                yield notificacion_service_1.default.crear({
                    usuario_id: usuarioDestinoId,
                    tipo: "asignacion",
                    titulo: "Petición transferida",
                    mensaje: `Se te ha asignado la petición #${peticion.id} del cliente ${peticion.cliente.nombre}`,
                    peticion_id: peticion.id,
                });
                peticionesTransferidas.push({
                    peticion_id: peticion.id,
                    usuario_destino_id: usuarioDestinoId,
                    usuario_destino_nombre: usuarioDestino.nombre_completo,
                });
                // Incrementar contador y avanzar al siguiente usuario
                usuariosConPeticiones.set(usuarioDestinoId, usuariosConPeticiones.get(usuarioDestinoId) + 1);
                indiceUsuarioActual = (indiceUsuarioActual + 1) % usuariosDestinoIds.length;
            }
            // Crear notificación para el usuario origen
            yield notificacion_service_1.default.crear({
                usuario_id: usuarioOrigenId,
                tipo: "sistema",
                titulo: "Peticiones transferidas",
                mensaje: `Se han transferido ${peticiones.length} peticiones a otros usuarios. Motivo: ${motivo}`,
            });
            // Emitir eventos WebSocket
            webSocket_service_1.webSocketService.emit("peticionesTransferidas", {
                usuario_origen_id: usuarioOrigenId,
                usuarios_destino_ids: usuariosDestinoIds,
                cantidad: peticiones.length,
                motivo,
            });
            return {
                total_transferidas: peticiones.length,
                usuario_origen: {
                    id: usuarioOrigen.uid,
                    nombre: usuarioOrigen.nombre_completo,
                },
                distribucion: Array.from(usuariosConPeticiones.entries()).map(([uid, cantidad]) => {
                    const usuario = usuariosDestino.find(u => u.uid === uid);
                    return {
                        usuario_id: uid,
                        usuario_nombre: usuario.nombre_completo,
                        peticiones_asignadas: cantidad,
                    };
                }),
                detalle: peticionesTransferidas,
            };
        });
    }
    /**
     * Calcular tiempo empleado actual incluyendo temporizador activo
     */
    calcularTiempoEmpleado(peticion) {
        return __awaiter(this, void 0, void 0, function* () {
            let tiempoTotal = peticion.tiempo_empleado_segundos;
            if (peticion.temporizador_activo && peticion.fecha_inicio_temporizador) {
                const ahora = new Date();
                const tiempoTranscurrido = Math.floor((ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000);
                tiempoTotal += tiempoTranscurrido;
            }
            return tiempoTotal;
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
