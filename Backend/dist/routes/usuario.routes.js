"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_controller_1 = require("../controllers/usuario.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleAuth_middleware_1 = require("../middleware/roleAuth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const usuario_validator_1 = require("../validators/usuario.validator");
const router = (0, express_1.Router)();
const usuarioController = new usuario_controller_1.UsuarioController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authMiddleware);
// Obtener usuarios conectados actualmente (Cualquier usuario autenticado)
router.get("/conectados/lista", usuarioController.obtenerConectados);
// Cambiar estado de presencia del usuario actual
router.put("/mi-presencia", usuarioController.cambiarEstadoPresencia);
// Actualizar última actividad del usuario actual
router.post("/mi-actividad", usuarioController.actualizarActividad);
// Obtener todos los usuarios (Admin, Directivo, Líder)
router.get("/", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), usuarioController.obtenerTodos);
// Obtener usuarios por área
router.get("/area/:area", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), usuarioController.obtenerPorArea);
// Obtener usuario por ID
router.get("/:uid", usuarioController.obtenerPorId);
// Actualizar usuario
router.put("/:uid", (0, validation_middleware_1.validate)(usuario_validator_1.actualizarUsuarioValidator), usuarioController.actualizar);
// Cambiar status (Solo Admin y Directivo)
router.patch("/:uid/status", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo"), usuarioController.cambiarStatus);
exports.default = router;
