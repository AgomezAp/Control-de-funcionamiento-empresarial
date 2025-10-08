import { Request, Response } from "express";
import { ClienteService } from "../services/cliente.service";
import { ApiResponse } from "../utils/response.util";

const clienteService = new ClienteService();

export class ClienteController {
  async crear(req: Request, res: Response) {
    try {
      const { nombre, pais, pautador_id, disenador_id, fecha_inicio } = req.body;

      const cliente = await clienteService.crear(
        {
          nombre,
          pais,
          pautador_id,
          disenador_id,
          fecha_inicio: new Date(fecha_inicio),
        },
        req.usuario
      );

      return ApiResponse.created(res, cliente, "Cliente creado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al crear cliente",
        error.statusCode || 500
      );
    }
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const clientes = await clienteService.obtenerTodos(req.usuario);

      return ApiResponse.success(res, clientes, "Clientes obtenidos exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener clientes",
        error.statusCode || 500
      );
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cliente = await clienteService.obtenerPorId(Number(id), req.usuario);

      return ApiResponse.success(res, cliente, "Cliente obtenido exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener cliente",
        error.statusCode || 500
      );
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cliente = await clienteService.actualizar(
        Number(id),
        req.body,
        req.usuario
      );

      return ApiResponse.success(res, cliente, "Cliente actualizado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al actualizar cliente",
        error.statusCode || 500
      );
    }
  }

  async desactivar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cliente = await clienteService.desactivar(Number(id), req.usuario);

      return ApiResponse.success(res, cliente, "Cliente desactivado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al desactivar cliente",
        error.statusCode || 500
      );
    }
  }
}