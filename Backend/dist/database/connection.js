"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("❌ DATABASE_URL no está definida en las variables de entorno");
}
const sequelize = new sequelize_1.Sequelize(databaseUrl, {
    dialect: "postgres",
    protocol: "postgres",
    timezone: "-03:00",
    dialectOptions: {
        useUTC: false,
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false, // Solo logs en desarrollo
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
exports.default = sequelize;
