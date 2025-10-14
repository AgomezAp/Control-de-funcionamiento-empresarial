import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer, Server as HttpServer } from "http";
import sequelize from "../database/connection";
import routes from "../routes/index";
import { iniciarCronJobs } from "../jobs/peticion.cron";
import { webSocketService } from "../services/webSocket.service";
import "../models/Relaciones";
dotenv.config();

class Server {
  private app: Application;
  private httpServer: HttpServer;
  private port: string;
  private apiPaths = {
    base: "/api",
  };

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = process.env.PORT || "3010";

    // Métodos iniciales
    this.conectarDB();
    this.middlewares();
    this.routes();
    this.initializeWebSocket();
    this.iniciarCrons();
    this.listen();
  }

  async conectarDB() {
    try {
      await sequelize.authenticate();
      console.log("✅ Conectado a la base de datos PostgreSQL con éxito");

      // ⬇️ AGREGA ESTO PARA CONFIRMAR QUE LAS ASOCIACIONES SE CARGARON
      console.log("🔗 Asociaciones de modelos cargadas");

      // Sincronizar modelos con la base de datos (alter: true para actualizar sin borrar)
      await sequelize.sync({ alter: false });
      console.log("✅ Modelos sincronizados con la base de datos");
    } catch (error) {
      console.error("❌ Error al conectar con la base de datos:", error);
      throw error;
    }
  }

  middlewares() {
    // CORS
    this.app.use(cors());

    // Lectura del body
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // Carpeta pública (si necesitas servir archivos estáticos)
    this.app.use(express.static("public"));

    // Log de peticiones en desarrollo
    if (process.env.NODE_ENV === "development") {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`);
        next();
      });
    }
  }

  routes() {
    // Ruta de health check
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        success: true,
        message: "🚀 API de Gestión de Peticiones funcionando correctamente",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      });
    });

    // Rutas de la API
    this.app.use(this.apiPaths.base, routes);

    // Manejo de rutas no encontradas
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
        path: req.path,
        method: req.method,
      });
    });

    // Manejo global de errores
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);
        res.status(err.statusCode || 500).json({
          success: false,
          message: err.message || "Error interno del servidor",
          ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
      }
    );
  }

  iniciarCrons() {
    try {
      iniciarCronJobs();
      console.log("✅ Cron jobs iniciados correctamente");
      console.log("   📅 Verificar peticiones vencidas: cada 30 minutos");
      console.log("   📦 Mover al histórico: cada hora");
      console.log("   📊 Calcular estadísticas: día 1 de cada mes a las 2 AM");
      console.log("   💰 Generar facturación: día 1 de cada mes a las 3 AM");
    } catch (error) {
      console.error("❌ Error al iniciar cron jobs:", error);
    }
  }

  initializeWebSocket() {
    try {
      webSocketService.initialize(this.httpServer);
      console.log("✅ WebSocket inicializado correctamente");
      console.log(`   🔌 Socket.IO escuchando en puerto: ${this.port}`);
    } catch (error) {
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

export default Server;
