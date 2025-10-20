"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cliente = exports.TipoCliente = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
var TipoCliente;
(function (TipoCliente) {
    TipoCliente["META_ADS"] = "Meta Ads";
    TipoCliente["GOOGLE_ADS"] = "Google Ads";
    TipoCliente["EXTERNO"] = "Externo";
    TipoCliente["OTRO"] = "Otro";
})(TipoCliente || (exports.TipoCliente = TipoCliente = {}));
class Cliente extends sequelize_1.Model {
}
exports.Cliente = Cliente;
Cliente.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    cedula: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: "Cédula o documento de identidad del cliente",
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
        comment: "Número de teléfono de contacto",
    },
    correo: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true,
        },
        comment: "Correo electrónico del cliente",
    },
    ciudad: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: "Ciudad de residencia",
    },
    direccion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: "Dirección completa de residencia",
    },
    pais: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    tipo_cliente: {
        type: sequelize_1.DataTypes.ENUM("Meta Ads", "Google Ads", "Externo", "Otro"),
        allowNull: false,
        defaultValue: "Otro",
    },
    pautador_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuarios",
            key: "uid",
        },
    },
    disenador_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "usuarios",
            key: "uid",
        },
    },
    fecha_creacion: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: "clientes",
    timestamps: false,
});
exports.default = Cliente;
