"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const peticion_controller_1 = require("../controllers/peticion.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleAuth_middleware_1 = require("../middleware/roleAuth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const peticion_validator_1 = require("../validators/peticion.validator");
const router = (0, express_1.Router)();
const peticionController = new peticion_controller_1.PeticionController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authMiddleware);
// ⚠️ IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
// Obtener peticiones pendientes
router.get("/pendientes", peticionController.obtenerPendientes);
// Obtener histórico de peticiones
router.get("/historico", peticionController.obtenerHistorico);
// Obtener resumen global (Admin, Directivo, Líder)
router.get("/resumen/global", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), peticionController.obtenerResumenGlobal);
// Obtener peticiones por cliente y mes
router.get("/cliente-mes", (0, validation_middleware_1.validate)(peticion_validator_1.obtenerPeticionesPorClienteMesValidator), peticionController.obtenerPorClienteYMes);
// Crear petición
router.post("/", (0, validation_middleware_1.validate)(peticion_validator_1.crearPeticionValidator), peticionController.crear);
// Obtener todas las peticiones (con filtros opcionales)
router.get("/", peticionController.obtenerTodos);
// Obtener petición por ID
router.get("/:id", peticionController.obtenerPorId);
// Aceptar petición (Diseñadores y Pautas)
router.post("/:id/aceptar", (0, validation_middleware_1.validate)(peticion_validator_1.aceptarPeticionValidator), peticionController.aceptarPeticion);
// Control de temporizador
router.post("/:id/pausar-temporizador", peticionController.pausarTemporizador);
router.post("/:id/reanudar-temporizador", peticionController.reanudarTemporizador);
router.get("/:id/tiempo-empleado", peticionController.obtenerTiempoEmpleado);
// Cambiar estado de petición
router.patch("/:id/estado", (0, validation_middleware_1.validate)(peticion_validator_1.cambiarEstadoPeticionValidator), peticionController.cambiarEstado);
// Actualizar petición
router.put("/:id", (0, validation_middleware_1.validate)(peticion_validator_1.actualizarPeticionValidator), peticionController.actualizar);
exports.default = router;
