import { Router } from "express";
import {
  crearReporte,
  obtenerReportes,
  obtenerReportePorId,
  asignarTecnico,
  vincularPeticion,
  actualizarEstado,
  obtenerReportesPendientes,
  obtenerEstadisticas,
  obtenerMisReportes,
} from "../controllers/reportes-clientes.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleAuth } from "../middleware/roleAuth.middleware";

const router = Router();

// Rutas protegidas - Todas requieren autenticación
router.use(authMiddleware);

// Obtener mis reportes (Gestión Administrativa)
// Cualquier usuario puede ver sus propios reportes
router.get("/mis-reportes", obtenerMisReportes);

// Crear reporte (todos los usuarios autenticados pueden crear reportes)
// Pero típicamente será usado por Gestión Administrativa
router.post("/", crearReporte);

// Obtener reportes con filtros (Admin/Directivo/Líder pueden ver todos)
router.get("/", roleAuth("Admin", "Directivo", "Líder"), obtenerReportes);

// Obtener reportes pendientes (Todos los técnicos pueden ver pendientes)
router.get("/pendientes", obtenerReportesPendientes);

// Obtener estadísticas
router.get("/estadisticas", obtenerEstadisticas);

// Obtener reporte por ID
router.get("/:id", obtenerReportePorId);

// Asignar técnico a reporte (Todos los usuarios pueden auto-asignarse)
router.patch("/:id/asignar", asignarTecnico);

// Vincular petición a reporte (Todos los usuarios pueden vincular)
router.patch("/:id/vincular", vincularPeticion);

// Actualizar estado del reporte
router.patch("/:id/estado", actualizarEstado);

export default router;
