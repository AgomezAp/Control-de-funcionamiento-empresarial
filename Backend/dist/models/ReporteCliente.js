"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoReporte = exports.PrioridadReporte = exports.TipoProblema = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
// Enums
var TipoProblema;
(function (TipoProblema) {
    TipoProblema["CAMPANA"] = "Campa\u00F1a";
    TipoProblema["DISENO_WEB"] = "Dise\u00F1o Web";
    TipoProblema["SOPORTE_TECNICO"] = "Soporte T\u00E9cnico";
    TipoProblema["CONSULTA_GENERAL"] = "Consulta General";
    TipoProblema["ESCALAMIENTO"] = "Escalamiento";
    TipoProblema["SEGUIMIENTO"] = "Seguimiento";
    TipoProblema["OTRO"] = "Otro";
})(TipoProblema || (exports.TipoProblema = TipoProblema = {}));
var PrioridadReporte;
(function (PrioridadReporte) {
    PrioridadReporte["BAJA"] = "Baja";
    PrioridadReporte["MEDIA"] = "Media";
    PrioridadReporte["ALTA"] = "Alta";
    PrioridadReporte["URGENTE"] = "Urgente";
})(PrioridadReporte || (exports.PrioridadReporte = PrioridadReporte = {}));
var EstadoReporte;
(function (EstadoReporte) {
    EstadoReporte["PENDIENTE"] = "Pendiente";
    EstadoReporte["EN_ATENCION"] = "En Atenci\u00F3n";
    EstadoReporte["RESUELTO"] = "Resuelto";
    EstadoReporte["CANCELADO"] = "Cancelado";
})(EstadoReporte || (exports.EstadoReporte = EstadoReporte = {}));
class ReporteCliente extends sequelize_1.Model {
}
ReporteCliente.init({
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
    tipo_problema: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(TipoProblema)),
        allowNull: false,
        defaultValue: TipoProblema.CONSULTA_GENERAL,
    },
    descripcion_problema: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    prioridad: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(PrioridadReporte)),
        allowNull: false,
        defaultValue: PrioridadReporte.MEDIA,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(EstadoReporte)),
        allowNull: false,
        defaultValue: EstadoReporte.PENDIENTE,
    },
    creado_por: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "uid",
        },
    },
    atendido_por: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "uid",
        },
    },
    peticiones_relacionadas: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Array de IDs de peticiones creadas para resolver este reporte",
    },
    notas_internas: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: "Notas internas para el equipo técnico",
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    fecha_atencion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    fecha_resolucion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: "reportes_clientes",
    timestamps: true,
});
exports.default = ReporteCliente;
