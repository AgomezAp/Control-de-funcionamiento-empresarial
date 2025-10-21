"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categoria_service_1 = __importDefault(require("../services/categoria.service"));
/**
 * Controlador para gestionar categorías
 */
class CategoriaController {
    /**
     * GET /api/categorias
     * Obtiene todas las categorías
     */
    obtenerTodas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categorias = yield categoria_service_1.default.obtenerTodas();
                res.status(200).json({
                    success: true,
                    data: categorias,
                    message: "Categorías obtenidas exitosamente",
                });
            }
            catch (error) {
                console.error("Error en obtenerTodas:", error);
                res.status(500).json({
                    success: false,
                    message: error.message || "Error al obtener las categorías",
                });
            }
        });
    }
    /**
     * GET /api/categorias/area/:area
     * Obtiene categorías filtradas por área
     */
    obtenerPorArea(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { area } = req.params;
                // Validar que el área sea válida
                const areasValidas = ["Diseño", "Pautas", "Gestión Administrativa"];
                if (!areasValidas.includes(area)) {
                    res.status(400).json({
                        success: false,
                        message: `El área debe ser una de las siguientes: ${areasValidas.join(", ")}`,
                    });
                    return;
                }
                const categorias = yield categoria_service_1.default.obtenerPorArea(area);
                res.status(200).json({
                    success: true,
                    data: categorias,
                    message: `Categorías del área ${area} obtenidas exitosamente`,
                });
            }
            catch (error) {
                console.error("Error en obtenerPorArea:", error);
                res.status(500).json({
                    success: false,
                    message: error.message || "Error al obtener las categorías por área",
                });
            }
        });
    }
    /**
     * GET /api/categorias/:id
     * Obtiene una categoría por su ID
     */
    obtenerPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const categoria = yield categoria_service_1.default.obtenerPorId(Number(id));
                if (!categoria) {
                    res.status(404).json({
                        success: false,
                        message: `No se encontró una categoría con el ID ${id}`,
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: categoria,
                    message: "Categoría obtenida exitosamente",
                });
            }
            catch (error) {
                console.error("Error en obtenerPorId:", error);
                res.status(500).json({
                    success: false,
                    message: error.message || "Error al obtener la categoría",
                });
            }
        });
    }
}
exports.default = new CategoriaController();
