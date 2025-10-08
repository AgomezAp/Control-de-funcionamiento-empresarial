import { Request, Response } from "express";
import { EstadisticaService } from "../services/estadistica.service";
import { ApiResponse } from "../utils/response.util";

const estadisticaService = new EstadisticaService();

export class EstadisticaController {
  async calcularEstadisticasUsuario(req: Request, res: Response) {
    try {
      const { usuario_id, año, mes } = req.body;

      const estadisticas = await estadisticaService.calcularEstadisticasUsuario(
        Number(usuario_id),
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        estadisticas,
        "Estadísticas calculadas exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al calcular estadísticas",
        error.statusCode || 500
      );
    }
  }

  async obtenerEstadisticasUsuario(req: Request, res: Response) {
    try {
      const { usuario_id } = req.params;
      const { año, mes } = req.query;

      const estadisticas = await estadisticaService.obtenerEstadisticasUsuario(
        Number(usuario_id),
        año ? Number(año) : undefined,
        mes ? Number(mes) : undefined
      );

      return ApiResponse.success(
        res,
        estadisticas,
        "Estadísticas obtenidas exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener estadísticas",
        error.statusCode || 500
      );
    }
  }

  async obtenerEstadisticasPorArea(req: Request, res: Response) {
    try {
      const { area } = req.params;
      const { año, mes } = req.query;

      const estadisticas = await estadisticaService.obtenerEstadisticasPorArea(
        area,
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        estadisticas,
        `Estadísticas del área ${area} obtenidas exitosamente`
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener estadísticas por área",
        error.statusCode || 500
      );
    }
  }

  async obtenerEstadisticasGlobales(req: Request, res: Response) {
    try {
      const { año, mes } = req.query;

      const estadisticas = await estadisticaService.obtenerEstadisticasGlobales(
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        estadisticas,
        "Estadísticas globales obtenidas exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener estadísticas globales",
        error.statusCode || 500
      );
    }
  }

  async recalcularTodasEstadisticas(req: Request, res: Response) {
    try {
      const { año, mes } = req.body;

      const estadisticas = await estadisticaService.recalcularTodasEstadisticas(
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        { total_recalculadas: estadisticas.length },
        "Estadísticas recalculadas exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al recalcular estadísticas",
        error.statusCode || 500
      );
    }
  }

  async obtenerMisEstadisticas(req: Request, res: Response) {
    try {
      const { año, mes } = req.query;

      const estadisticas = await estadisticaService.obtenerEstadisticasUsuario(
        req.usuario!.uid,
        año ? Number(año) : undefined,
        mes ? Number(mes) : undefined
      );

      return ApiResponse.success(
        res,
        estadisticas,
        "Tus estadísticas obtenidas exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener tus estadísticas",
        error.statusCode || 500
      );
    }
  }
}