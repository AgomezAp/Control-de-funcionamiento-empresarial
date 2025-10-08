import { Router } from "express";
import { FacturacionController } from "../controllers/facturacion.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleAuth } from "../middleware/roleAuth.middleware";

const router = Router();
const facturacionController = new FacturacionController();

// Todas las rutas requieren autenticación y roles elevados
router.use(authMiddleware);
router.use(roleAuth("Admin", "Directivo"));

// Generar periodo de facturación para un cliente
router.post("/generar", facturacionController.generarPeriodoFacturacion);

// Generar periodos para todos los clientes
router.post(
  "/generar-todos",
  roleAuth("Admin"),
  facturacionController.generarPeriodosParaTodosLosClientes
);

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

export default router;