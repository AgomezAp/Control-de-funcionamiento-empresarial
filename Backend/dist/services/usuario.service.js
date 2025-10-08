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
exports.UsuarioService = void 0;
const Usuario_1 = __importDefault(require("../models/Usuario"));
const Role_1 = __importDefault(require("../models/Role"));
const Area_1 = __importDefault(require("../models/Area"));
const bcrypt_util_1 = require("../utils/bcrypt.util");
const error_util_1 = require("../utils/error.util");
const auditoria_service_1 = require("./auditoria.service");
class UsuarioService {
    constructor() {
        this.auditoriaService = new auditoria_service_1.AuditoriaService();
    }
    obtenerTodos(usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = {};
            // Si es Directivo o Líder, solo ver de su área
            if (["Directivo", "Líder"].includes(usuarioActual.rol)) {
                const area = yield Area_1.default.findOne({ where: { nombre: usuarioActual.area } });
                whereClause.area_id = area === null || area === void 0 ? void 0 : area.id;
            }
            const usuarios = yield Usuario_1.default.findAll({
                where: whereClause,
                attributes: { exclude: ["contrasena"] },
                include: [
                    { model: Role_1.default, as: "rol", attributes: ["id", "nombre"] },
                    { model: Area_1.default, as: "area", attributes: ["id", "nombre"] },
                ],
            });
            return usuarios;
        });
    }
    obtenerPorId(uid, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield Usuario_1.default.findByPk(uid, {
                attributes: { exclude: ["contrasena"] },
                include: [
                    { model: Role_1.default, as: "rol", attributes: ["id", "nombre"] },
                    { model: Area_1.default, as: "area", attributes: ["id", "nombre"] },
                ],
            });
            if (!usuario) {
                throw new error_util_1.NotFoundError("Usuario no encontrado");
            }
            // Verificar permisos
            if (usuarioActual.rol === "Usuario" && usuarioActual.uid !== uid) {
                throw new error_util_1.ForbiddenError("No tienes permiso para ver este usuario");
            }
            if (["Directivo", "Líder"].includes(usuarioActual.rol)) {
                if (usuario.area.nombre !== usuarioActual.area) {
                    throw new error_util_1.ForbiddenError("No tienes permiso para ver usuarios de otra área");
                }
            }
            return usuario;
        });
    }
    actualizar(uid, data, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const usuario = yield Usuario_1.default.findByPk(uid);
            if (!usuario) {
                throw new error_util_1.NotFoundError("Usuario no encontrado");
            }
            // Solo Admin puede cambiar roles
            if (data.rol_id && usuarioActual.rol !== "Admin") {
                throw new error_util_1.ForbiddenError("Solo Admin puede cambiar roles");
            }
            // Si cambia contraseña, hashearla
            if (data.contrasena) {
                data.contrasena = yield (0, bcrypt_util_1.hashPassword)(data.contrasena);
            }
            // Registrar cambios en auditoría
            const cambios = {};
            Object.keys(data).forEach((key) => {
                if (usuario[key] !== data[key]) {
                    cambios[key] = {
                        anterior: usuario[key],
                        nuevo: data[key],
                    };
                }
            });
            yield usuario.update(data);
            // Registrar en auditoría
            for (const campo in cambios) {
                yield this.auditoriaService.registrarCambio({
                    tabla_afectada: "usuarios",
                    registro_id: uid,
                    tipo_cambio: "UPDATE",
                    campo_modificado: campo,
                    valor_anterior: (_a = cambios[campo].anterior) === null || _a === void 0 ? void 0 : _a.toString(),
                    valor_nuevo: (_b = cambios[campo].nuevo) === null || _b === void 0 ? void 0 : _b.toString(),
                    usuario_id: usuarioActual.uid,
                    descripcion: `Actualización del campo ${campo}`,
                });
            }
            return yield Usuario_1.default.findByPk(uid, {
                attributes: { exclude: ["contrasena"] },
                include: [
                    { model: Role_1.default, as: "rol" },
                    { model: Area_1.default, as: "area" },
                ],
            });
        });
    }
    cambiarStatus(uid, status, usuarioActual) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield Usuario_1.default.findByPk(uid);
            if (!usuario) {
                throw new error_util_1.NotFoundError("Usuario no encontrado");
            }
            // Solo Admin y Directivo pueden cambiar status
            if (!["Admin", "Directivo"].includes(usuarioActual.rol)) {
                throw new error_util_1.ForbiddenError("No tienes permiso para cambiar el status");
            }
            yield usuario.update({ status });
            // Registrar en auditoría
            yield this.auditoriaService.registrarCambio({
                tabla_afectada: "usuarios",
                registro_id: uid,
                tipo_cambio: "UPDATE",
                campo_modificado: "status",
                valor_anterior: (!status).toString(),
                valor_nuevo: status.toString(),
                usuario_id: usuarioActual.uid,
                descripcion: `Cambio de status a ${status ? "activo" : "inactivo"}`,
            });
            return usuario;
        });
    }
    obtenerPorArea(areaNombre) {
        return __awaiter(this, void 0, void 0, function* () {
            const area = yield Area_1.default.findOne({ where: { nombre: areaNombre } });
            if (!area) {
                throw new error_util_1.NotFoundError("Área no encontrada");
            }
            return yield Usuario_1.default.findAll({
                where: { area_id: area.id, status: true },
                attributes: { exclude: ["contrasena"] },
                include: [
                    { model: Role_1.default, as: "rol" },
                    { model: Area_1.default, as: "area" },
                ],
            });
        });
    }
}
exports.UsuarioService = UsuarioService;
