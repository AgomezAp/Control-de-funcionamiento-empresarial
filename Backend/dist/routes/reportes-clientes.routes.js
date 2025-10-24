"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportes_clientes_controller_1 = require("../controllers/reportes-clientes.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleAuth_middleware_1 = require("../middleware/roleAuth.middleware");
const router = (0, express_1.Router)();
// Rutas protegidas - Todas requieren autenticación
router.use(auth_middleware_1.authMiddleware);
// Obtener mis reportes (Gestión Administrativa)
// Cualquier usuario puede ver sus propios reportes
router.get("/mis-reportes", reportes_clientes_controller_1.obtenerMisReportes);
// Crear reporte (todos los usuarios autenticados pueden crear reportes)
// Pero típicamente será usado por Gestión Administrativa
router.post("/", reportes_clientes_controller_1.crearReporte);
// Obtener reportes con filtros (Admin/Directivo/Líder pueden ver todos)
router.get("/", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), reportes_clientes_controller_1.obtenerReportes);
// Obtener reportes pendientes (Todos los técnicos pueden ver pendientes)
router.get("/pendientes", reportes_clientes_controller_1.obtenerReportesPendientes);
// Obtener estadísticas
router.get("/estadisticas", reportes_clientes_controller_1.obtenerEstadisticas);
// Obtener reporte por ID
router.get("/:id", reportes_clientes_controller_1.obtenerReportePorId);
// Asignar técnico a reporte (Todos los usuarios pueden auto-asignarse)
router.patch("/:id/asignar", reportes_clientes_controller_1.asignarTecnico);
// Vincular petición a reporte (Todos los usuarios pueden vincular)
router.patch("/:id/vincular", reportes_clientes_controller_1.vincularPeticion);
// Actualizar estado del reporte
router.patch("/:id/estado", reportes_clientes_controller_1.actualizarEstado);
exports.default = router;
