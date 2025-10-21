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
const Categoria_1 = __importDefault(require("../models/Categoria"));
/**
 * Servicio para gestionar categorías
 */
class CategoriaService {
    /**
     * Obtiene todas las categorías ordenadas por nombre
     */
    obtenerTodas() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categorias = yield Categoria_1.default.findAll({
                    order: [["nombre", "ASC"]],
                });
                return categorias;
            }
            catch (error) {
                console.error("Error al obtener todas las categorías:", error);
                throw new Error("Error al obtener las categorías");
            }
        });
    }
    /**
     * Obtiene categorías filtradas por área
     * @param area - El área para filtrar (Diseño, Pautas, Gestión Administrativa)
     */
    obtenerPorArea(area) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categorias = yield Categoria_1.default.findAll({
                    where: { area_tipo: area },
                    order: [["nombre", "ASC"]],
                });
                return categorias;
            }
            catch (error) {
                console.error(`Error al obtener categorías del área ${area}:`, error);
                throw new Error(`Error al obtener categorías del área ${area}`);
            }
        });
    }
    /**
     * Obtiene una categoría por su ID
     * @param id - El ID de la categoría
     */
    obtenerPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoria = yield Categoria_1.default.findByPk(id);
                return categoria;
            }
            catch (error) {
                console.error(`Error al obtener categoría con ID ${id}:`, error);
                throw new Error(`Error al obtener la categoría con ID ${id}`);
            }
        });
    }
}
exports.default = new CategoriaService();
