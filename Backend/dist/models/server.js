"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const connection_1 = __importDefault(require("../database/connection"));
const index_1 = __importDefault(require("../routes/index"));
const peticion_cron_1 = require("../jobs/peticion.cron");
const webSocket_service_1 = require("../services/webSocket.service");
require("../models/Relaciones");
dotenv_1.default.config();
class Server {
    constructor() {
        this.apiPaths = {
            base: "/api",
        };
        this.app = (0, express_1.default)();
        this.httpServer = (0, http_1.createServer)(this.app);
        this.port = process.env.PORT || "3010";
        // Métodos iniciales
        this.conectarDB();
        this.middlewares();
        this.routes();
        this.initializeWebSocket();
        this.iniciarCrons();
        this.listen();
    }
    conectarDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connection_1.default.authenticate();
                console.log("✅ Conectado a la base de datos PostgreSQL con éxito");
                // ⬇️ AGREGA ESTO PARA CONFIRMAR QUE LAS ASOCIACIONES SE CARGARON
                console.log("🔗 Asociaciones de modelos cargadas");
                // Sincronizar modelos con la base de datos (alter: true para actualizar sin borrar)
                yield connection_1.default.sync({ alter: false });
                console.log("✅ Modelos sincronizados con la base de datos");
            }
            catch (error) {
                console.error("❌ Error al conectar con la base de datos:", error);
                throw error;
            }
        });
    }
    middlewares() {
        // CORS
        this.app.use((0, cors_1.default)());
        // Lectura del body
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Carpeta pública (si necesitas servir archivos estáticos)
        this.app.use(express_1.default.static("public"));
        // Log de peticiones en desarrollo
        if (process.env.NODE_ENV === "development") {
            this.app.use((req, res, next) => {
                console.log(`${req.method} ${req.path}`);
                next();
            });
        }
    }
    routes() {
        // Ruta de health check
        this.app.get("/", (req, res) => {
            res.json({
                success: true,
                message: "🚀 API de Gestión de Peticiones funcionando correctamente",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
            });
        });
        // Rutas de la API
        this.app.use(this.apiPaths.base, index_1.default);
        // Manejo de rutas no encontradas
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: "Ruta no encontrada",
                path: req.path,
                method: req.method,
            });
        });
        // Manejo global de errores
        this.app.use((err, req, res, next) => {
            console.error("Error:", err);
            res.status(err.statusCode || 500).json(Object.assign({ success: false, message: err.message || "Error interno del servidor" }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
        });
    }
    iniciarCrons() {
        try {
            (0, peticion_cron_1.iniciarCronJobs)();
            console.log("✅ Cron jobs iniciados correctamente");
            console.log("   📅 Verificar peticiones vencidas: cada 30 minutos");
            console.log("   📦 Mover al histórico: cada hora");
            console.log("   📊 Calcular estadísticas: día 1 de cada mes a las 2 AM");
            console.log("   💰 Generar facturación: día 1 de cada mes a las 3 AM");
        }
        catch (error) {
            console.error("❌ Error al iniciar cron jobs:", error);
        }
    }
    initializeWebSocket() {
        try {
            webSocket_service_1.webSocketService.initialize(this.httpServer);
            console.log("✅ WebSocket inicializado correctamente");
            console.log(`   🔌 Socket.IO escuchando en puerto: ${this.port}`);
        }
        catch (error) {
            console.error("❌ Error al inicializar WebSocket:", error);
        }
    }
    listen() {
        this.httpServer.listen(this.port, () => {
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`🚀 Servidor corriendo en puerto: ${this.port}`);
            console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`);
            console.log(`🔗 URL: http://localhost:${this.port}`);
            console.log(`📚 API: http://localhost:${this.port}/api`);
            console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        });
    }
}
exports.default = Server;
