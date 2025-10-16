import { Router } from "express";
import { FacturacionController } from "../controllers/facturacion.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleAuth } from "../middleware/roleAuth.middleware";

const router = Router();
const facturacionController = new FacturacionController();

// ✅ CORREGIDO: Solo autenticación general, permisos específicos por ruta
router.use(authMiddleware);

// Generar periodo de facturación para un cliente (SOLO ADMIN)
router.post("/generar", roleAuth("Admin"), facturacionController.generarPeriodoFacturacion);

// Generar periodos para todos los clientes
router.post(
  "/generar-todos",
  roleAuth("Admin"),
  facturacionController.generarPeriodosParaTodosLosClientes
);

// Generar facturación automática para peticiones resueltas (SOLO ADMIN)
router.post(
  "/generar-automatica",
  roleAuth("Admin"),
  facturacionController.generarFacturacionAutomatica
);

// ✅ Obtener resumen de facturación mensual (Admin y Directivo pueden VER)
router.get("/resumen", roleAuth("Admin", "Directivo"), facturacionController.obtenerResumenFacturacionMensual);

// ✅ Obtener detalle de un periodo específico (Admin y Directivo pueden VER)
router.get("/detalle", roleAuth("Admin", "Directivo"), facturacionController.obtenerDetallePeriodo);

// ✅ Obtener periodo por ID (Admin y Directivo pueden VER)
router.get("/:id", roleAuth("Admin", "Directivo"), facturacionController.obtenerPeriodoPorId);

// Cerrar periodo (SOLO ADMIN puede MODIFICAR)
router.patch("/:id/cerrar", roleAuth("Admin"), facturacionController.cerrarPeriodo);

// Facturar periodo (SOLO ADMIN puede MODIFICAR)
router.patch("/:id/facturar", roleAuth("Admin"), facturacionController.facturarPeriodo);

// ✅ Obtener periodos de un cliente (Admin y Directivo pueden VER)
router.get("/cliente/:cliente_id", roleAuth("Admin", "Directivo"), facturacionController.obtenerPeriodosPorCliente);

export default router;