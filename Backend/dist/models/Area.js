"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Area = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Area extends sequelize_1.Model {
}
exports.Area = Area;
Area.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.ENUM("Gestión Administrativa", "Pautas", "Diseño", "Contabilidad", "Programación"),
        allowNull: false,
        unique: true,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: "areas",
    timestamps: false,
});
exports.default = Area;
