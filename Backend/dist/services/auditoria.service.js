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
exports.AuditoriaService = void 0;
const AuditoriaCambio_1 = __importDefault(require("../models/AuditoriaCambio"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const sequelize_1 = require("sequelize");
class AuditoriaService {
    registrarCambio(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AuditoriaCambio_1.default.create(data);
            }
            catch (error) {
                console.error("Error al registrar auditoría:", error);
            }
        });
    }
    obtenerPorTabla(tabla, registro_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { tabla_afectada: tabla };
            if (registro_id) {
                whereClause.registro_id = registro_id;
            }
            return yield AuditoriaCambio_1.default.findAll({
                where: whereClause,
                include: [
                    {
                        model: Usuario_1.default,
                        as: "usuario",
                        attributes: ["uid", "nombre_completo", "correo"],
                    },
                ],
                order: [["fecha_cambio", "DESC"]],
            });
        });
    }
    obtenerPorUsuario(usuario_id, fechaInicio, fechaFin) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = { usuario_id };
            if (fechaInicio && fechaFin) {
                whereClause.fecha_cambio = {
                    [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                };
            }
            return yield AuditoriaCambio_1.default.findAll({
                where: whereClause,
                order: [["fecha_cambio", "DESC"]],
            });
        });
    }
    obtenerPorRango(fechaInicio, fechaFin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield AuditoriaCambio_1.default.findAll({
                where: {
                    fecha_cambio: {
                        [sequelize_1.Op.between]: [fechaInicio, fechaFin],
                    },
                },
                include: [
                    {
                        model: Usuario_1.default,
                        as: "usuario",
                        attributes: ["uid", "nombre_completo"],
                    },
                ],
                order: [["fecha_cambio", "DESC"]],
            });
        });
    }
}
exports.AuditoriaService = AuditoriaService;
