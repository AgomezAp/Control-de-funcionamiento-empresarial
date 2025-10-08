"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Categoria = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Categoria extends sequelize_1.Model {
}
exports.Categoria = Categoria;
Categoria.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    area_tipo: {
        type: sequelize_1.DataTypes.ENUM("Diseño", "Pautas"),
        allowNull: false,
    },
    costo: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    es_variable: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "True para casos como Modelado 3D donde el costo varía",
    },
    requiere_descripcion_extra: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "True para casos como Estrategias de seguimiento",
    },
}, {
    sequelize: connection_1.default,
    tableName: "categorias",
    timestamps: false,
});
exports.default = Categoria;
