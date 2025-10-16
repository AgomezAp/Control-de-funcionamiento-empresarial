"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadisticaUsuario = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class EstadisticaUsuario extends sequelize_1.Model {
}
exports.EstadisticaUsuario = EstadisticaUsuario;
EstadisticaUsuario.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "uid",
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
    peticiones_creadas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    peticiones_resueltas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    peticiones_canceladas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    tiempo_promedio_resolucion_horas: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    costo_total_generado: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    fecha_calculo: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    // ✅ Nuevos campos: Peticiones actuales asignadas (independiente del periodo)
    peticiones_pendientes_actual: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    peticiones_en_progreso_actual: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    peticiones_pausadas_actual: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: connection_1.default,
    tableName: "estadisticas_usuarios",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["usuario_id", "año", "mes"],
        },
    ],
});
exports.default = EstadisticaUsuario;
