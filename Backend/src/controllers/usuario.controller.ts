import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";
import { ApiResponse } from "../utils/response.util";

const usuarioService = new UsuarioService();

export class UsuarioController {
  async obtenerTodos(req: Request, res: Response) {
    try {
      const usuarios = await usuarioService.obtenerTodos(req.usuario);

      return ApiResponse.success(res, usuarios, "Usuarios obtenidos exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener usuarios",
        error.statusCode || 500
      );
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const { uid } = req.params;

      const usuario = await usuarioService.obtenerPorId(Number(uid), req.usuario);

      return ApiResponse.success(res, usuario, "Usuario obtenido exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener usuario",
        error.statusCode || 500
      );
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const { uid } = req.params;

      const usuario = await usuarioService.actualizar(
        Number(uid),
        req.body,
        req.usuario
      );

      return ApiResponse.success(res, usuario, "Usuario actualizado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al actualizar usuario",
        error.statusCode || 500
      );
    }
  }

  async cambiarStatus(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const { status } = req.body;

      const usuario = await usuarioService.cambiarStatus(
        Number(uid),
        status,
        req.usuario
      );

      return ApiResponse.success(
        res,
        usuario,
        `Usuario ${status ? "activado" : "desactivado"} exitosamente`
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al cambiar status",
        error.statusCode || 500
      );
    }
  }

  async obtenerPorArea(req: Request, res: Response) {
    try {
      const { area } = req.params;

      const usuarios = await usuarioService.obtenerPorArea(area);

      return ApiResponse.success(
        res,
        usuarios,
        `Usuarios del área ${area} obtenidos exitosamente`
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener usuarios por área",
        error.statusCode || 500
      );
    }
  }
}