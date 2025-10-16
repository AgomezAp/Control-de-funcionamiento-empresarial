"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturacion_controller_1 = require("../controllers/facturacion.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleAuth_middleware_1 = require("../middleware/roleAuth.middleware");
const router = (0, express_1.Router)();
const facturacionController = new facturacion_controller_1.FacturacionController();
// ✅ CORREGIDO: Solo autenticación general, permisos específicos por ruta
router.use(auth_middleware_1.authMiddleware);
// Generar periodo de facturación para un cliente (SOLO ADMIN)
router.post("/generar", (0, roleAuth_middleware_1.roleAuth)("Admin"), facturacionController.generarPeriodoFacturacion);
// Generar periodos para todos los clientes
router.post("/generar-todos", (0, roleAuth_middleware_1.roleAuth)("Admin"), facturacionController.generarPeriodosParaTodosLosClientes);
// Generar facturación automática para peticiones resueltas (SOLO ADMIN)
router.post("/generar-automatica", (0, roleAuth_middleware_1.roleAuth)("Admin"), facturacionController.generarFacturacionAutomatica);
// ✅ Obtener resumen de facturación mensual (Admin y Directivo pueden VER)
router.get("/resumen", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo"), facturacionController.obtenerResumenFacturacionMensual);
// ✅ Obtener detalle de un periodo específico (Admin y Directivo pueden VER)
router.get("/detalle", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo"), facturacionController.obtenerDetallePeriodo);
// ✅ Obtener periodo por ID (Admin y Directivo pueden VER)
router.get("/:id", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo"), facturacionController.obtenerPeriodoPorId);
// Cerrar periodo (SOLO ADMIN puede MODIFICAR)
router.patch("/:id/cerrar", (0, roleAuth_middleware_1.roleAuth)("Admin"), facturacionController.cerrarPeriodo);
// Facturar periodo (SOLO ADMIN puede MODIFICAR)
router.patch("/:id/facturar", (0, roleAuth_middleware_1.roleAuth)("Admin"), facturacionController.facturarPeriodo);
// ✅ Obtener periodos de un cliente (Admin y Directivo pueden VER)
router.get("/cliente/:cliente_id", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo"), facturacionController.obtenerPeriodosPorCliente);
exports.default = router;
