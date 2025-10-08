"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeticionHistorico = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class PeticionHistorico extends sequelize_1.Model {
}
exports.PeticionHistorico = PeticionHistorico;
PeticionHistorico.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    peticion_id_original: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: "ID de la petición original antes de mover al histórico",
    },
    cliente_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    categoria_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    descripcion_extra: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    costo: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("Resuelta", "Cancelada"),
        allowNull: false,
    },
    creador_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    asignado_a: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    fecha_aceptacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    fecha_limite: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    fecha_resolucion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    fecha_movido_historico: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    tiempo_limite_horas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: "peticiones_historico",
    timestamps: false,
});
exports.default = PeticionHistorico;
