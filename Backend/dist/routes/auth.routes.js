"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const usuario_validator_1 = require("../validators/usuario.validator");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Rutas públicas
router.post("/registro", (0, validation_middleware_1.validate)(usuario_validator_1.registroUsuarioValidator), authController.registrar);
router.post("/login", (0, validation_middleware_1.validate)(usuario_validator_1.loginValidator), authController.login);
// Rutas protegidas
router.get("/perfil", auth_middleware_1.authMiddleware, authController.perfil);
exports.default = router;
