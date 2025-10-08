"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditoriaCambios = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class AuditoriaCambios extends sequelize_1.Model {
}
exports.AuditoriaCambios = AuditoriaCambios;
AuditoriaCambios.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tabla_afectada: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        comment: "Nombre de la tabla que sufrió el cambio",
    },
    registro_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: "ID del registro afectado",
    },
    tipo_cambio: {
        type: sequelize_1.DataTypes.ENUM("INSERT", "UPDATE", "DELETE", "ASIGNACION", "CAMBIO_ESTADO"),
        allowNull: false,
    },
    campo_modificado: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: "Campo específico que cambió (para UPDATE)",
    },
    valor_anterior: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    valor_nuevo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "uid",
        },
        comment: "Usuario que realizó el cambio",
    },
    fecha_cambio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: "Descripción adicional del cambio",
    },
}, {
    sequelize: connection_1.default,
    tableName: "auditoria_cambios",
    timestamps: false,
});
exports.default = AuditoriaCambios;
