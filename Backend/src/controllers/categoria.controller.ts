import { Request, Response } from "express";
import categoriaService from "../services/categoria.service";

/**
 * Controlador para gestionar categorías
 */
class CategoriaController {
  /**
   * GET /api/categorias
   * Obtiene todas las categorías
   */
  async obtenerTodas(req: Request, res: Response): Promise<void> {
    try {
      const categorias = await categoriaService.obtenerTodas();
      res.status(200).json({
        success: true,
        data: categorias,
        message: "Categorías obtenidas exitosamente",
      });
    } catch (error: any) {
      console.error("Error en obtenerTodas:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener las categorías",
      });
    }
  }

  /**
   * GET /api/categorias/area/:area
   * Obtiene categorías filtradas por área
   */
  async obtenerPorArea(req: Request, res: Response): Promise<void> {
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

      const categorias = await categoriaService.obtenerPorArea(area);
      res.status(200).json({
        success: true,
        data: categorias,
        message: `Categorías del área ${area} obtenidas exitosamente`,
      });
    } catch (error: any) {
      console.error("Error en obtenerPorArea:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener las categorías por área",
      });
    }
  }

  /**
   * GET /api/categorias/:id
   * Obtiene una categoría por su ID
   */
  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.obtenerPorId(Number(id));

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
    } catch (error: any) {
      console.error("Error en obtenerPorId:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener la categoría",
      });
    }
  }
}

export default new CategoriaController();
