"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Notificacion extends sequelize_1.Model {
}
Notificacion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: "Usuario que recibe la notificación",
    },
    tipo: {
        type: sequelize_1.DataTypes.ENUM("asignacion", "cambio_estado", "comentario", "mencion", "sistema"),
        allowNull: false,
        comment: "Tipo de notificación",
    },
    titulo: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        comment: "Título breve de la notificación",
    },
    mensaje: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: "Mensaje detallado de la notificación",
    },
    peticion_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: "ID de la petición relacionada (si aplica)",
    },
    leida: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica si la notificación fue leída",
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    fecha_lectura: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: "Fecha en que se marcó como leída",
    },
}, {
    sequelize: connection_1.default,
    tableName: "notificaciones",
    timestamps: false,
    indexes: [
        {
            name: "idx_usuario_leida",
            fields: ["usuario_id", "leida"],
        },
        {
            name: "idx_fecha_creacion",
            fields: ["fecha_creacion"],
        },
    ],
});
exports.default = Notificacion;
