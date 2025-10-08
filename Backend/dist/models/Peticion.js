"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peticion = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Peticion extends sequelize_1.Model {
}
exports.Peticion = Peticion;
Peticion.init({
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
    categoria_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "categorias",
            key: "id",
        },
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    descripcion_extra: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: "Campo extra para categorías como Estrategias de seguimiento",
    },
    costo: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "Se toma de la categoría o se ingresa manual si es variable",
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("Pendiente", "En Progreso", "Resuelta", "Cancelada"),
        allowNull: false,
        defaultValue: "Pendiente",
    },
    creador_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "uid",
        },
        comment: "Usuario que creó la petición",
    },
    asignado_a: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "uid",
        },
        comment: "Diseñador/Usuario que aceptó la petición",
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    fecha_aceptacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: "Cuando el diseñador acepta la petición",
    },
    fecha_limite: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: "Se calcula desde fecha_aceptacion + tiempo_limite_horas",
    },
    fecha_resolucion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    tiempo_limite_horas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: "Horas límite para completar la tarea desde que se acepta",
    },
}, {
    sequelize: connection_1.default,
    tableName: "peticiones",
    timestamps: false,
});
exports.default = Peticion;
