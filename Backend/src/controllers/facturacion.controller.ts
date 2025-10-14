import { Request, Response } from "express";
import { FacturacionService } from "../services/facturacion.service";
import { ApiResponse } from "../utils/response.util";

const facturacionService = new FacturacionService();

export class FacturacionController {
  async generarPeriodoFacturacion(req: Request, res: Response) {
    try {
      const { cliente_id, año, mes } = req.body;

      const periodo = await facturacionService.generarPeriodoFacturacion(
        Number(cliente_id),
        Number(año),
        Number(mes)
      );

      return ApiResponse.created(
        res,
        periodo,
        "Periodo de facturación generado exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al generar periodo de facturación",
        error.statusCode || 500
      );
    }
  }

  async obtenerPeriodoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const periodo = await facturacionService.obtenerPeriodoPorId(Number(id));

      return ApiResponse.success(
        res,
        periodo,
        "Periodo de facturación obtenido exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener periodo de facturación",
        error.statusCode || 500
      );
    }
  }

  async obtenerPeriodosPorCliente(req: Request, res: Response) {
    try {
      const { cliente_id } = req.params;
      const { año } = req.query;

      const periodos = await facturacionService.obtenerPeriodosPorCliente(
        Number(cliente_id),
        año ? Number(año) : undefined
      );

      return ApiResponse.success(
        res,
        periodos,
        "Periodos de facturación obtenidos exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener periodos de facturación",
        error.statusCode || 500
      );
    }
  }

  async obtenerDetallePeriodo(req: Request, res: Response) {
    try {
      const { cliente_id, año, mes } = req.query;

      const detalle = await facturacionService.obtenerDetallePeriodo(
        Number(cliente_id),
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        detalle,
        "Detalle del periodo obtenido exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener detalle del periodo",
        error.statusCode || 500
      );
    }
  }

  async cerrarPeriodo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const periodo = await facturacionService.cerrarPeriodo(Number(id));

      return ApiResponse.success(res, periodo, "Periodo cerrado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al cerrar periodo",
        error.statusCode || 500
      );
    }
  }

  async facturarPeriodo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const periodo = await facturacionService.facturarPeriodo(Number(id));

      return ApiResponse.success(res, periodo, "Periodo facturado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al facturar periodo",
        error.statusCode || 500
      );
    }
  }

  async obtenerResumenFacturacionMensual(req: Request, res: Response) {
    try {
      const { año, mes } = req.query;

      const resumen = await facturacionService.obtenerResumenFacturacionMensual(
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        resumen,
        "Resumen de facturación obtenido exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener resumen de facturación",
        error.statusCode || 500
      );
    }
  }

  async generarPeriodosParaTodosLosClientes(req: Request, res: Response) {
    try {
      const { año, mes } = req.body;

      const periodos = await facturacionService.generarPeriodosParaTodosLosClientes(
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        { total_generados: periodos.length },
        "Periodos generados para todos los clientes exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al generar periodos para todos los clientes",
        error.statusCode || 500
      );
    }
  }

  async generarFacturacionAutomatica(req: Request, res: Response) {
    try {
      const { año, mes } = req.body;

      const resultado = await facturacionService.generarFacturacionAutomatica(
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        resultado,
        "Facturación automática generada exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al generar facturación automática",
        error.statusCode || 500
      );
    }
  }
}