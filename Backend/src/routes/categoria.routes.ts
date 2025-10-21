import { Router } from "express";
import categoriaController from "../controllers/categoria.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * Todas las rutas de categorías requieren autenticación
 */

/**
 * @route   GET /api/categorias
 * @desc    Obtiene todas las categorías
 * @access  Privado (requiere JWT)
 */
router.get("/", authMiddleware, categoriaController.obtenerTodas);

/**
 * @route   GET /api/categorias/area/:area
 * @desc    Obtiene categorías filtradas por área
 * @access  Privado (requiere JWT)
 */
router.get("/area/:area", authMiddleware, categoriaController.obtenerPorArea);

/**
 * @route   GET /api/categorias/:id
 * @desc    Obtiene una categoría por su ID
 * @access  Privado (requiere JWT)
 */
router.get("/:id", authMiddleware, categoriaController.obtenerPorId);

export default router;
