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
    area: {
        type: sequelize_1.DataTypes.ENUM("Pautas", "Diseño"),
        allowNull: false,
        comment: "Área a la que pertenece la petición: Pautas o Diseño",
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("Pendiente", "En Progreso", "Pausada", "Resuelta", "Cancelada"),
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
    fecha_resolucion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    tiempo_empleado_segundos: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Tiempo total empleado en segundos",
    },
    temporizador_activo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica si el temporizador está corriendo actualmente",
    },
    fecha_inicio_temporizador: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: "Última vez que se inició o reanudó el temporizador",
    },
    fecha_pausa_temporizador: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: "Última vez que se pausó el temporizador",
    },
}, {
    sequelize: connection_1.default,
    tableName: "peticiones",
    timestamps: false,
});
exports.default = Peticion;
