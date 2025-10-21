import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";
import { ApiResponse } from "../utils/response.util";
import { webSocketService } from "../services/webSocket.service";

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

  /**
   * Obtener IDs de usuarios conectados actualmente
   */
  async obtenerConectados(req: Request, res: Response) {
    try {
      const usuariosConectadosIds = webSocketService.getConnectedUsers();

      return ApiResponse.success(
        res,
        {
          usuarios: usuariosConectadosIds,
          total: usuariosConectadosIds.length,
          timestamp: new Date(),
        },
        "Usuarios conectados obtenidos exitosamente"
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener usuarios conectados",
        error.statusCode || 500
      );
    }
  }

  /**
   * Cambiar estado de presencia del usuario actual
   */
  async cambiarEstadoPresencia(req: Request, res: Response) {
    try {
      if (!req.usuario) {
        return ApiResponse.error(res, "Usuario no autenticado", 401);
      }

      const { estadoPresencia } = req.body;

      if (!estadoPresencia) {
        return ApiResponse.error(res, "El estado de presencia es requerido", 400);
      }

      const usuario = await usuarioService.cambiarEstadoPresencia(
        req.usuario.uid,
        estadoPresencia,
        req.usuario
      );

      // Emitir evento de cambio de estado vía WebSocket
      webSocketService.emit("cambioEstadoPresencia", {
        userId: req.usuario.uid,
        estadoPresencia,
        timestamp: new Date(),
      });

      return ApiResponse.success(
        res,
        usuario,
        `Estado de presencia cambiado a ${estadoPresencia}`
      );
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al cambiar estado de presencia",
        error.statusCode || 500
      );
    }
  }

  /**
   * Actualizar última actividad del usuario actual
   */
  async actualizarActividad(req: Request, res: Response) {
    try {
      if (!req.usuario) {
        return ApiResponse.error(res, "Usuario no autenticado", 401);
      }

      await usuarioService.actualizarActividad(req.usuario.uid);

      return ApiResponse.success(res, null, "Actividad actualizada");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al actualizar actividad",
        error.statusCode || 500
      );
    }
  }
}