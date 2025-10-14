"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturacion_controller_1 = require("../controllers/facturacion.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleAuth_middleware_1 = require("../middleware/roleAuth.middleware");
const router = (0, express_1.Router)();
const facturacionController = new facturacion_controller_1.FacturacionController();
// Todas las rutas requieren autenticación y roles elevados
router.use(auth_middleware_1.authMiddleware);
router.use((0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo"));
// Generar periodo de facturación para un cliente
router.post("/generar", facturacionController.generarPeriodoFacturacion);
// Generar periodos para todos los clientes
router.post("/generar-todos", (0, roleAuth_middleware_1.roleAuth)("Admin"), facturacionController.generarPeriodosParaTodosLosClientes);
// Generar facturación automática para peticiones resueltas
router.post("/generar-automatica", facturacionController.generarFacturacionAutomatica);
// Obtener resumen de facturación mensual
router.get("/resumen", facturacionController.obtenerResumenFacturacionMensual);
// Obtener detalle de un periodo específico
router.get("/detalle", facturacionController.obtenerDetallePeriodo);
// Obtener periodo por ID
router.get("/:id", facturacionController.obtenerPeriodoPorId);
// Cerrar periodo
router.patch("/:id/cerrar", facturacionController.cerrarPeriodo);
// Facturar periodo
router.patch("/:id/facturar", facturacionController.facturarPeriodo);
// Obtener periodos de un cliente
router.get("/cliente/:cliente_id", facturacionController.obtenerPeriodosPorCliente);
exports.default = router;
