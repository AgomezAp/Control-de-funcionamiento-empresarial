"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodoFacturacion = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class PeriodoFacturacion extends sequelize_1.Model {
}
exports.PeriodoFacturacion = PeriodoFacturacion;
PeriodoFacturacion.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cliente_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "clientes",
            key: "id",
        },
    },
    año: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    mes: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 12,
        },
    },
    total_peticiones: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    costo_total: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    fecha_generacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("Abierto", "Cerrado", "Facturado"),
        allowNull: false,
        defaultValue: "Abierto",
    },
}, {
    sequelize: connection_1.default,
    tableName: "periodos_facturacion",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["cliente_id", "año", "mes"],
        },
    ],
});
exports.default = PeriodoFacturacion;
