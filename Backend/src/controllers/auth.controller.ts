import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../utils/response.util";

const authService = new AuthService();

export class AuthController {
  async registrar(req: Request, res: Response) {
    try {
      const { nombre_completo, correo, contrasena, rol_id, area_id } = req.body;

      const usuario = await authService.registrarUsuario({
        nombre_completo,
        correo,
        contrasena,
        rol_id,
        area_id,
      });

      return ApiResponse.created(res, usuario, "Usuario registrado exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al registrar usuario",
        error.statusCode || 500
      );
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { correo, contrasena } = req.body;

      const resultado = await authService.login(correo, contrasena);

      return ApiResponse.success(res, resultado, "Login exitoso");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al iniciar sesión",
        error.statusCode || 500
      );
    }
  }

  async perfil(req: Request, res: Response) {
    try {
      // req.usuario viene del middleware de autenticación
      return ApiResponse.success(res, req.usuario, "Perfil obtenido exitosamente");
    } catch (error: any) {
      return ApiResponse.error(
        res,
        error.message || "Error al obtener perfil",
        error.statusCode || 500
      );
    }
  }
}