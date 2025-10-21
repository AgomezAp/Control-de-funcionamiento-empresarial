import Categoria from "../models/Categoria";

/**
 * Servicio para gestionar categorías
 */
class CategoriaService {
  /**
   * Obtiene todas las categorías ordenadas por nombre
   */
  async obtenerTodas(): Promise<Categoria[]> {
    try {
      const categorias = await Categoria.findAll({
        order: [["nombre", "ASC"]],
      });
      return categorias;
    } catch (error) {
      console.error("Error al obtener todas las categorías:", error);
      throw new Error("Error al obtener las categorías");
    }
  }

  /**
   * Obtiene categorías filtradas por área
   * @param area - El área para filtrar (Diseño, Pautas, Gestión Administrativa)
   */
  async obtenerPorArea(area: string): Promise<Categoria[]> {
    try {
      const categorias = await Categoria.findAll({
        where: { area_tipo: area },
        order: [["nombre", "ASC"]],
      });
      return categorias;
    } catch (error) {
      console.error(`Error al obtener categorías del área ${area}:`, error);
      throw new Error(`Error al obtener categorías del área ${area}`);
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param id - El ID de la categoría
   */
  async obtenerPorId(id: number): Promise<Categoria | null> {
    try {
      const categoria = await Categoria.findByPk(id);
      return categoria;
    } catch (error) {
      console.error(`Error al obtener categoría con ID ${id}:`, error);
      throw new Error(`Error al obtener la categoría con ID ${id}`);
    }
  }
}

export default new CategoriaService();
