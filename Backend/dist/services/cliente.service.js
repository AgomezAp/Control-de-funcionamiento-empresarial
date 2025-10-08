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
exports.ClienteService = void 0;
const Cliente_1 = __importDefault(require("../models/Cliente"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Area_1 = __importDefault(require("../models/Area"));
const error_util_1 = require("../utils/error.util");
const auditoria_service_1 = require("./auditoria.service");
class ClienteService {
    constructor() {
        this.auditoriaService = new auditoria_service_1.AuditoriaService();
    }
    crear(data, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el pautador existe y es del área de Pautas
            const pautador = yield Usuario_1.default.findByPk(data.pautador_id, {
                include: [{ model: Area_1.default, as: "area" }],
            });
            if (!pautador) {
                throw new error_util_1.NotFoundError("El pautador especificado no existe");
            }
            if (pautador.area.nombre !== "Pautas") {
                throw new error_util_1.ValidationError("El usuario asignado como pautador no pertenece al área de Pautas");
            }
            // Verificar diseñador si se proporciona
            if (data.disenador_id) {
                const disenador = yield Usuario_1.default.findByPk(data.disenador_id, {
                    include: [{ model: Area_1.default, as: "area" }],
                });
                if (!disenador) {
                    throw new error_util_1.NotFoundError("El diseñador especificado no existe");
                }
                if (disenador.area.nombre !== "Diseño") {
                    throw new error_util_1.ValidationError("El usuario asignado como diseñador no pertenece al área de Diseño");
                }
            }
            const cliente = yield Cliente_1.default.create(data);
            // Registrar en auditoría
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "clientes",
                registro_id: cliente.id,
                tipo_cambio: "INSERT",
                valor_nuevo: JSON.stringify(data),
                usuario_id: usuarioActual.uid,
                descripcion: "Creación de nuevo cliente",
            });
            return yield Cliente_1.default.findByPk(cliente.id, {
                include: [
                    { model: Usuario_1.default, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
                    { model: Usuario_1.default, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
                ],
            });
        });
    }
    obtenerTodos(usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { status: true };
            // Si es Usuario, solo ver sus clientes
            if (usuarioActual.rol === "Usuario") {
                const area = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
                if ((area === null || area === void 0 ? void 0 : area.nombre) === "Pautas") {
                    whereClause.pautador_id = usuarioActual.uid;
                }
                else if ((area === null || area === void 0 ? void 0 : area.nombre) === "Diseño") {
                    whereClause.disenador_id = usuarioActual.uid;
                }
            }
            // Si es Líder o Directivo, ver de su área
            if (["Líder", "Directivo"].includes(usuarioActual.rol)) {
                const area = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
                if ((area === null || area === void 0 ? void 0 : area.nombre) === "Pautas") {
                    const usuariosArea = yield Usuario_1.default.findAll({
                        where: { area_id: area.id },
                        attributes: ["uid"],
                    });
                    whereClause.pautador_id = usuariosArea.map((u) => u.uid);
                }
                else if ((area === null || area === void 0 ? void 0 : area.nombre) === "Diseño") {
                    const usuariosArea = yield Usuario_1.default.findAll({
                        where: { area_id: area.id },
                        attributes: ["uid"],
                    });
                    whereClause.disenador_id = usuariosArea.map((u) => u.uid);
                }
            }
            return yield Cliente_1.default.findAll({
                where: whereClause,
                include: [
                    { model: Usuario_1.default, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
                    { model: Usuario_1.default, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
                ],
                order: [["fecha_creacion", "DESC"]],
            });
        });
    }
    obtenerPorId(id, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const cliente = yield Cliente_1.default.findByPk(id, {
                include: [
                    { model: Usuario_1.default, as: "pautador", attributes: ["uid", "nombre_completo", "correo"] },
                    { model: Usuario_1.default, as: "disenador", attributes: ["uid", "nombre_completo", "correo"] },
                ],
            });
            if (!cliente) {
                throw new error_util_1.NotFoundError("Cliente no encontrado");
            }
            // Verificar permisos
            if (usuarioActual.rol === "Usuario") {
                const area = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
                if ((area === null || area === void 0 ? void 0 : area.nombre) === "Pautas" && cliente.pautador_id !== usuarioActual.uid) {
                    throw new error_util_1.ForbiddenError("No tienes permiso para ver este cliente");
                }
                if ((area === null || area === void 0 ? void 0 : area.nombre) === "Diseño" && cliente.disenador_id !== usuarioActual.uid) {
                    throw new error_util_1.ForbiddenError("No tienes permiso para ver este cliente");
                }
            }
            return cliente;
        });
    }
    actualizar(id, data, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cliente = yield Cliente_1.default.findByPk(id);
            if (!cliente) {
                throw new error_util_1.NotFoundError("Cliente no encontrado");
            }
            // Verificar cambios de pautador o diseñador
            if (data.pautador_id && data.pautador_id !== cliente.pautador_id) {
                const nuevoPautador = yield Usuario_1.default.findByPk(data.pautador_id, {
                    include: [{ model: Area_1.default, as: "area" }],
                });
                if (!nuevoPautador || nuevoPautador.area.nombre !== "Pautas") {
                    throw new error_util_1.ValidationError("El nuevo pautador debe pertenecer al área de Pautas");
                }
                // Registrar cambio
                yield this.auditoriaService.registrarCambio({
                    tabla_afectada: "clientes",
                    registro_id: id,
                    tipo_cambio: "ASIGNACION",
                    campo_modificado: "pautador_id",
                    valor_anterior: cliente.pautador_id.toString(),
                    valor_nuevo: data.pautador_id.toString(),
                    usuario_id: usuarioActual.uid,
                    descripcion: "Cambio de pautador asignado",
                });
            }
            if (data.disenador_id && data.disenador_id !== cliente.disenador_id) {
                const nuevoDisenador = yield Usuario_1.default.findByPk(data.disenador_id, {
                    include: [{ model: Area_1.default, as: "area" }],
                });
                if (!nuevoDisenador || nuevoDisenador.area.nombre !== "Diseño") {
                    throw new error_util_1.ValidationError("El nuevo diseñador debe pertenecer al área de Diseño");
                }
                // Registrar cambio
                yield this.auditoriaService.registrarCambio({
                    tabla_afectada: "clientes",
                    registro_id: id,
                    tipo_cambio: "ASIGNACION",
                    campo_modificado: "disenador_id",
                    valor_anterior: ((_a = cliente.disenador_id) === null || _a === void 0 ? void 0 : _a.toString()) || "null",
                    valor_nuevo: data.disenador_id.toString(),
                    usuario_id: usuarioActual.uid,
                    descripcion: "Cambio de diseñador asignado",
                });
            }
            yield cliente.update(data);
            return yield Cliente_1.default.findByPk(id, {
                include: [
                    { model: Usuario_1.default, as: "pautador", attributes: ["uid", "nombre_completo"] },
                    { model: Usuario_1.default, as: "disenador", attributes: ["uid", "nombre_completo"] },
                ],
            });
        });
    }
    desactivar(id, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const cliente = yield Cliente_1.default.findByPk(id);
            if (!cliente) {
                throw new error_util_1.NotFoundError("Cliente no encontrado");
            }
            yield cliente.update({ status: false });
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "clientes",
                registro_id: id,
                tipo_cambio: "UPDATE",
                campo_modificado: "status",
                valor_anterior: "true",
                valor_nuevo: "false",
                usuario_id: usuarioActual.uid,
                descripcion: "Desactivación de cliente",
            });
            return cliente;
        });
    }
}
exports.ClienteService = ClienteService;
