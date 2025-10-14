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
exports.detenerCronJobs = exports.iniciarCronJobs = exports.generarPeriodosFacturacion = exports.calcularEstadisticasMensuales = exports.moverPeticionesResueltasAHistorico = exports.verificarPeticionesConMuchoTiempo = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Peticion_1 = __importDefault(require("../models/Peticion"));
const sequelize_1 = require("sequelize");
const peticion_service_1 = require("../services/peticion.service");
const estadistica_service_1 = require("../services/estadistica.service");
const facturacion_service_1 = require("../services/facturacion.service");
const webSocket_service_1 = require("../services/webSocket.service");
const peticionService = new peticion_service_1.PeticionService();
const estadisticaService = new estadistica_service_1.EstadisticaService();
const facturacionService = new facturacion_service_1.FacturacionService();
// ==========================================
// CRON: Revisar peticiones con mucho tiempo empleado
// Se ejecuta cada 30 minutos
// ==========================================
exports.verificarPeticionesConMuchoTiempo = node_cron_1.default.schedule("*/30 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔄 Verificando peticiones con mucho tiempo empleado...");
        // Buscar peticiones en progreso con temporizador activo
        const peticionesEnProgreso = yield Peticion_1.default.findAll({
            where: {
                estado: "En Progreso",
                temporizador_activo: true,
            },
        });
        if (peticionesEnProgreso.length > 0) {
            console.log(`⏱️  ${peticionesEnProgreso.length} peticiones en progreso con temporizador activo`);
            for (const peticion of peticionesEnProgreso) {
                // Calcular tiempo total empleado
                const ahora = new Date();
                const tiempoTranscurrido = Math.floor((ahora.getTime() - peticion.fecha_inicio_temporizador.getTime()) / 1000);
                const tiempoTotal = peticion.tiempo_empleado_segundos + tiempoTranscurrido;
                const horasEmpleadas = Math.floor(tiempoTotal / 3600);
                // Notificar si lleva más de 8 horas
                if (horasEmpleadas >= 8) {
                    console.log(`⚠️  Petición ${peticion.id} - Tiempo empleado: ${horasEmpleadas} horas`);
                    // Emitir evento WebSocket de alerta
                    const peticionCompleta = yield peticionService.obtenerPorId(peticion.id);
                    webSocket_service_1.webSocketService.emitPeticionVencida(peticion.id, peticionCompleta);
                }
            }
        }
        else {
            console.log("✅ No hay peticiones con temporizador activo");
        }
    }
    catch (error) {
        console.error("❌ Error verificando peticiones:", error);
    }
}));
// ==========================================
// CRON: Mover peticiones resueltas al histórico
// Se ejecuta cada hora
// ==========================================
exports.moverPeticionesResueltasAHistorico = node_cron_1.default.schedule("0 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔄 Moviendo peticiones resueltas al histórico...");
        const peticionesParaMover = yield Peticion_1.default.findAll({
            where: {
                estado: {
                    [sequelize_1.Op.in]: ["Resuelta", "Cancelada"],
                },
            },
        });
        if (peticionesParaMover.length > 0) {
            console.log(`📦 ${peticionesParaMover.length} peticiones para mover`);
            for (const peticion of peticionesParaMover) {
                yield peticionService.moverAHistorico(peticion);
            }
            console.log("✅ Peticiones movidas exitosamente");
        }
        else {
            console.log("✅ No hay peticiones para mover");
        }
    }
    catch (error) {
        console.error("❌ Error moviendo peticiones al histórico:", error);
    }
}));
// ==========================================
// CRON: Calcular estadísticas mensuales
// Se ejecuta el primer día de cada mes a las 2 AM
// ==========================================
exports.calcularEstadisticasMensuales = node_cron_1.default.schedule("0 2 1 * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("📊 Calculando estadísticas mensuales...");
        const ahora = new Date();
        const mesAnterior = ahora.getMonth() === 0 ? 12 : ahora.getMonth();
        const añoAnterior = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();
        yield estadisticaService.recalcularTodasEstadisticas(añoAnterior, mesAnterior);
        console.log(`✅ Estadísticas calculadas para ${añoAnterior}-${mesAnterior}`);
    }
    catch (error) {
        console.error("❌ Error calculando estadísticas:", error);
    }
}));
// ==========================================
// CRON: Generar periodos de facturación
// Se ejecuta el primer día de cada mes a las 3 AM
// ==========================================
exports.generarPeriodosFacturacion = node_cron_1.default.schedule("0 3 1 * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("💰 Generando periodos de facturación...");
        const ahora = new Date();
        const mesAnterior = ahora.getMonth() === 0 ? 12 : ahora.getMonth();
        const añoAnterior = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();
        yield facturacionService.generarPeriodosParaTodosLosClientes(añoAnterior, mesAnterior);
        console.log(`✅ Periodos de facturación generados para ${añoAnterior}-${mesAnterior}`);
    }
    catch (error) {
        console.error("❌ Error generando periodos de facturación:", error);
    }
}));
// ==========================================
// Iniciar todos los cron jobs
// ==========================================
const iniciarCronJobs = () => {
    console.log("🚀 Iniciando cron jobs...");
    exports.verificarPeticionesConMuchoTiempo.start();
    exports.moverPeticionesResueltasAHistorico.start();
    exports.calcularEstadisticasMensuales.start();
    exports.generarPeriodosFacturacion.start();
    console.log("✅ Cron jobs iniciados correctamente");
};
exports.iniciarCronJobs = iniciarCronJobs;
// Detener todos los cron jobs
const detenerCronJobs = () => {
    exports.verificarPeticionesConMuchoTiempo.stop();
    exports.moverPeticionesResueltasAHistorico.stop();
    exports.calcularEstadisticasMensuales.stop();
    exports.generarPeriodosFacturacion.stop();
    console.log("⏸️  Cron jobs detenidos");
};
exports.detenerCronJobs = detenerCronJobs;
