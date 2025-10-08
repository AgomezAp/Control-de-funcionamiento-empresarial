import { Router } from "express";
import { EstadisticaController } from "../controllers/estadistica.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleAuth } from "../middleware/roleAuth.middleware";

const router = Router();
const estadisticaController = new EstadisticaController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener mis propias estadísticas (cualquier usuario)
router.get("/mis-estadisticas", estadisticaController.obtenerMisEstadisticas);

// Calcular estadísticas de un usuario (Admin)
router.post(
  "/calcular",
  roleAuth("Admin"),
  estadisticaController.calcularEstadisticasUsuario
);

// Recalcular todas las estadísticas (Solo Admin)
router.post(
  "/recalcular",
  roleAuth("Admin"),
  estadisticaController.recalcularTodasEstadisticas
);

// Obtener estadísticas globales (Admin)
router.get(
  "/globales",
  roleAuth("Admin"),
  estadisticaController.obtenerEstadisticasGlobales
);

// Obtener estadísticas por área (Admin, Directivo, Líder)
router.get(
  "/area/:area",
  roleAuth("Admin", "Directivo", "Líder"),
  estadisticaController.obtenerEstadisticasPorArea
);

// Obtener estadísticas de un usuario (Admin, Directivo, Líder)
router.get(
  "/usuario/:usuario_id",
  roleAuth("Admin", "Directivo", "Líder"),
  estadisticaController.obtenerEstadisticasUsuario
);

export default router;