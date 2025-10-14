import cron from "node-cron";
import Peticion from "../models/Peticion";
import { Op } from "sequelize";
import { PeticionService } from "../services/peticion.service";
import { EstadisticaService } from "../services/estadistica.service";
import { FacturacionService } from "../services/facturacion.service";
import { webSocketService } from "../services/webSocket.service";

const peticionService = new PeticionService();
const estadisticaService = new EstadisticaService();
const facturacionService = new FacturacionService();

// ==========================================
// CRON: Revisar peticiones con mucho tiempo empleado
// Se ejecuta cada 30 minutos
// ==========================================
export const verificarPeticionesConMuchoTiempo = cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("🔄 Verificando peticiones con mucho tiempo empleado...");

    // Buscar peticiones en progreso con temporizador activo
    const peticionesEnProgreso = await Peticion.findAll({
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
        const tiempoTranscurrido = Math.floor(
          (ahora.getTime() - peticion.fecha_inicio_temporizador!.getTime()) / 1000
        );
        const tiempoTotal = peticion.tiempo_empleado_segundos + tiempoTranscurrido;
        const horasEmpleadas = Math.floor(tiempoTotal / 3600);

        // Notificar si lleva más de 8 horas
        if (horasEmpleadas >= 8) {
          console.log(`⚠️  Petición ${peticion.id} - Tiempo empleado: ${horasEmpleadas} horas`);
          
          // Emitir evento WebSocket de alerta
          const peticionCompleta = await peticionService.obtenerPorId(peticion.id);
          webSocketService.emitPeticionVencida(peticion.id, peticionCompleta);
        }
      }
    } else {
      console.log("✅ No hay peticiones con temporizador activo");
    }
  } catch (error) {
    console.error("❌ Error verificando peticiones:", error);
  }
});

// ==========================================
// CRON: Mover peticiones resueltas al histórico
// Se ejecuta cada hora
// ==========================================
export const moverPeticionesResueltasAHistorico = cron.schedule("0 * * * *", async () => {
  try {
    console.log("🔄 Moviendo peticiones resueltas al histórico...");

    const peticionesParaMover = await Peticion.findAll({
      where: {
        estado: {
          [Op.in]: ["Resuelta", "Cancelada"],
        },
      },
    });

    if (peticionesParaMover.length > 0) {
      console.log(`📦 ${peticionesParaMover.length} peticiones para mover`);

      for (const peticion of peticionesParaMover) {
        await peticionService.moverAHistorico(peticion);
      }

      console.log("✅ Peticiones movidas exitosamente");
    } else {
      console.log("✅ No hay peticiones para mover");
    }
  } catch (error) {
    console.error("❌ Error moviendo peticiones al histórico:", error);
  }
});

// ==========================================
// CRON: Calcular estadísticas mensuales
// Se ejecuta el primer día de cada mes a las 2 AM
// ==========================================
export const calcularEstadisticasMensuales = cron.schedule("0 2 1 * *", async () => {
  try {
    console.log("📊 Calculando estadísticas mensuales...");

    const ahora = new Date();
    const mesAnterior = ahora.getMonth() === 0 ? 12 : ahora.getMonth();
    const añoAnterior = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();

    await estadisticaService.recalcularTodasEstadisticas(añoAnterior, mesAnterior);

    console.log(`✅ Estadísticas calculadas para ${añoAnterior}-${mesAnterior}`);
  } catch (error) {
    console.error("❌ Error calculando estadísticas:", error);
  }
});

// ==========================================
// CRON: Generar periodos de facturación
// Se ejecuta el primer día de cada mes a las 3 AM
// ==========================================
export const generarPeriodosFacturacion = cron.schedule("0 3 1 * *", async () => {
  try {
    console.log("💰 Generando periodos de facturación...");

    const ahora = new Date();
    const mesAnterior = ahora.getMonth() === 0 ? 12 : ahora.getMonth();
    const añoAnterior = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();

    await facturacionService.generarPeriodosParaTodosLosClientes(añoAnterior, mesAnterior);

    console.log(`✅ Periodos de facturación generados para ${añoAnterior}-${mesAnterior}`);
  } catch (error) {
    console.error("❌ Error generando periodos de facturación:", error);
  }
});

// ==========================================
// Iniciar todos los cron jobs
// ==========================================
export const iniciarCronJobs = () => {
  console.log("🚀 Iniciando cron jobs...");

  verificarPeticionesConMuchoTiempo.start();
  moverPeticionesResueltasAHistorico.start();
  calcularEstadisticasMensuales.start();
  generarPeriodosFacturacion.start();

  console.log("✅ Cron jobs iniciados correctamente");
};

// Detener todos los cron jobs
export const detenerCronJobs = () => {
  verificarPeticionesConMuchoTiempo.stop();
  moverPeticionesResueltasAHistorico.stop();
  calcularEstadisticasMensuales.stop();
  generarPeriodosFacturacion.stop();

  console.log("⏸️  Cron jobs detenidos");
};