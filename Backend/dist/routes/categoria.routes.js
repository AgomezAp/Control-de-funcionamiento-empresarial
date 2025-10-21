"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoria_controller_1 = __importDefault(require("../controllers/categoria.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Todas las rutas de categorías requieren autenticación
 */
/**
 * @route   GET /api/categorias
 * @desc    Obtiene todas las categorías
 * @access  Privado (requiere JWT)
 */
router.get("/", auth_middleware_1.authMiddleware, categoria_controller_1.default.obtenerTodas);
/**
 * @route   GET /api/categorias/area/:area
 * @desc    Obtiene categorías filtradas por área
 * @access  Privado (requiere JWT)
 */
router.get("/area/:area", auth_middleware_1.authMiddleware, categoria_controller_1.default.obtenerPorArea);
/**
 * @route   GET /api/categorias/:id
 * @desc    Obtiene una categoría por su ID
 * @access  Privado (requiere JWT)
 */
router.get("/:id", auth_middleware_1.authMiddleware, categoria_controller_1.default.obtenerPorId);
exports.default = router;
