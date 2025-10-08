"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Role extends sequelize_1.Model {
}
exports.Role = Role;
Role.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.ENUM("Admin", "Directivo", "Líder", "Usuario"),
        allowNull: false,
        unique: true,
    },
    descripcion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: "roles",
    timestamps: false,
});
exports.default = Role;
