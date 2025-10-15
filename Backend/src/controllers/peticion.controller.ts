import { Request, Response } from "express";
import { PeticionService } from "../services/peticion.service";
import { ApiResponse } from "../utils/response.util";

const peticionService = new PeticionService();

export class PeticionController {
  async crear(req: Request, res: Response) {
    try {
      const {
        cliente_id,
        categoria_id,
        area,
        descripcion,
        descripcion_extra,
        costo,
        tiempo_limite_horas,
      } = req.body;

      const peticion = await peticionService.crear(
        {
          cliente_id,
          categoria_id,
          area,
          descripcion,
          descripcion_extra,
          costo,
          tiempo_limite_horas,
        },
        req.usuario
      );

      return ApiResponse.created(res, peticion, "Petición creada exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al crear petición",
        error.statusCode || 500
      );
    }
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const { estado, cliente_id, area } = req.query;

      const filtros: any = {};
      if (estado) filtros.estado = estado;
      if (cliente_id) filtros.cliente_id = Number(cliente_id);
      if (area) filtros.area = area;

      const peticiones = await peticionService.obtenerTodos(req.usuario, filtros);

      return ApiResponse.success(res, peticiones, "Peticiones obtenidas exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener peticiones",
        error.statusCode || 500
      );
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const peticion = await peticionService.obtenerPorId(Number(id));

      return ApiResponse.success(res, peticion, "Petición obtenida exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener petición",
        error.statusCode || 500
      );
    }
  }

  async obtenerPendientes(req: Request, res: Response) {
    try {
      const { area } = req.query;

      const peticiones = await peticionService.obtenerPendientes(area as string);

      return ApiResponse.success(
        res,
        peticiones,
        "Peticiones pendientes obtenidas exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener peticiones pendientes",
        error.statusCode || 500
      );
    }
  }

  async aceptarPeticion(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const peticion = await peticionService.aceptarPeticion(
        Number(id),
        req.usuario
      );

      return ApiResponse.success(res, peticion, "Petición aceptada exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al aceptar petición",
        error.statusCode || 500
      );
    }
  }

  async cambiarEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const peticion = await peticionService.cambiarEstado(
        Number(id),
        estado,
        req.usuario
      );

      return ApiResponse.success(
        res,
        peticion,
        `Estado cambiado a ${estado} exitosamente`
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al cambiar estado",
        error.statusCode || 500
      );
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const peticion = await peticionService.actualizar(
        Number(id),
        req.body,
        req.usuario
      );

      return ApiResponse.success(res, peticion, "Petición actualizada exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al actualizar petición",
        error.statusCode || 500
      );
    }
  }

  async obtenerPorClienteYMes(req: Request, res: Response) {
    try {
      const { cliente_id, año, mes } = req.query;

      const resultado = await peticionService.obtenerPorClienteYMes(
        Number(cliente_id),
        Number(año),
        Number(mes)
      );

      return ApiResponse.success(
        res,
        resultado,
        "Peticiones del cliente obtenidas exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener peticiones por cliente y mes",
        error.statusCode || 500
      );
    }
  }

  async obtenerHistorico(req: Request, res: Response) {
    try {
      const { cliente_id, estado, año, mes } = req.query;

      const filtros: any = {};
      if (cliente_id) filtros.cliente_id = Number(cliente_id);
      if (estado) filtros.estado = estado;
      if (año) filtros.año = Number(año);
      if (mes) filtros.mes = Number(mes);

      const historico = await peticionService.obtenerHistorico(filtros, req.usuario);

      return ApiResponse.success(
        res,
        historico,
        "Histórico de peticiones obtenido exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener histórico",
        error.statusCode || 500
      );
    }
  }

  async obtenerResumenGlobal(req: Request, res: Response) {
    try {
      const resumen = await peticionService.obtenerResumenGlobal();

      return ApiResponse.success(
        res,
        resumen,
        "Resumen global de peticiones obtenido exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener resumen global",
        error.statusCode || 500
      );
    }
  }

  // ====== CONTROL DE TEMPORIZADOR ======

  async pausarTemporizador(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const peticion = await peticionService.pausarTemporizador(
        Number(id),
        req.usuario
      );

      return ApiResponse.success(res, peticion, "Temporizador pausado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al pausar temporizador",
        error.statusCode || 500
      );
    }
  }

  async reanudarTemporizador(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const peticion = await peticionService.reanudarTemporizador(
        Number(id),
        req.usuario
      );

      return ApiResponse.success(res, peticion, "Temporizador reanudado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al reanudar temporizador",
        error.statusCode || 500
      );
    }
  }

  async obtenerTiempoEmpleado(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tiempoEmpleado = await peticionService.obtenerTiempoEmpleado(Number(id));

      return ApiResponse.success(res, tiempoEmpleado, "Tiempo empleado obtenido exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener tiempo empleado",
        error.statusCode || 500
      );
    }
  }
}
