"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estadistica_controller_1 = require("../controllers/estadistica.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleAuth_middleware_1 = require("../middleware/roleAuth.middleware");
const router = (0, express_1.Router)();
const estadisticaController = new estadistica_controller_1.EstadisticaController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authMiddleware);
// Obtener mis propias estadísticas (cualquier usuario)
router.get("/mis-estadisticas", estadisticaController.obtenerMisEstadisticas);
// Calcular estadísticas de un usuario (Admin)
router.post("/calcular", (0, roleAuth_middleware_1.roleAuth)("Admin"), estadisticaController.calcularEstadisticasUsuario);
// Recalcular todas las estadísticas (Solo Admin)
router.post("/recalcular", (0, roleAuth_middleware_1.roleAuth)("Admin"), estadisticaController.recalcularTodasEstadisticas);
// Obtener estadísticas globales (Admin)
router.get("/globales", (0, roleAuth_middleware_1.roleAuth)("Admin"), estadisticaController.obtenerEstadisticasGlobales);
// Obtener estadísticas por área (Admin, Directivo, Líder)
router.get("/area/:area", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), estadisticaController.obtenerEstadisticasPorArea);
// Obtener estadísticas de un usuario (Admin, Directivo, Líder)
router.get("/usuario/:usuario_id", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), estadisticaController.obtenerEstadisticasUsuario);
exports.default = router;
