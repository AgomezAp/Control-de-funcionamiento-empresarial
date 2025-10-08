"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cliente_controller_1 = require("../controllers/cliente.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const roleAuth_middleware_1 = require("../middleware/roleAuth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const cliente_validator_1 = require("../validators/cliente.validator");
const router = (0, express_1.Router)();
const clienteController = new cliente_controller_1.ClienteController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authMiddleware);
// Crear cliente (Admin, Directivo, Líder)
router.post("/", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), (0, validation_middleware_1.validate)(cliente_validator_1.crearClienteValidator), clienteController.crear);
// Obtener todos los clientes
router.get("/", clienteController.obtenerTodos);
// Obtener cliente por ID
router.get("/:id", clienteController.obtenerPorId);
// Actualizar cliente (Admin, Directivo, Líder)
router.put("/:id", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo", "Líder"), (0, validation_middleware_1.validate)(cliente_validator_1.actualizarClienteValidator), clienteController.actualizar);
// Desactivar cliente (Solo Admin y Directivo)
router.delete("/:id", (0, roleAuth_middleware_1.roleAuth)("Admin", "Directivo"), clienteController.desactivar);
exports.default = router;
